import React, { useEffect, useState } from "react";
import {
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";
import ForceGraph2D from 'react-force-graph-2d';
import Button from "react-bootstrap/Button";
import { Play, Pause,ArrowCounterclockwise} from 'react-bootstrap-icons';

const Graph = (props: ComponentProps) => {

  const {initial_graph, events, time_interval, graphprops, continuous_play, directed} = props.args;

  let time=0;
  let initial_data = { nodes:initial_graph.nodes, links:initial_graph.links }
  const [statedata, setData] = useState({network:initial_data,time:time,paused:true});

  useEffect(() => Streamlit.setFrameHeight());

  // play pause from button
  let playpause = () => {
    setData((statedata)=>{
      
      // time should be reset if pressing play after previous simulation finished
      var network = statedata.network;
      var time = statedata.time;
      if (time === events.length && statedata.paused) {
        network = initial_data
        time = 0
      }

      return {
        network:network,
        time:time,
        paused: !statedata.paused
      }
    })
  };

  // reset from reset button press
  let reset = () => {
    setData((statedata)=>{
      return {
        network:initial_data,
        time:0,
        paused:true
      }
    })
  }

  //listen for prop changes and reset state
  useEffect(()=>{
    setData({network:initial_graph,time:0,paused:true})
  },[initial_graph,events, time_interval, graphprops, continuous_play]);

  useEffect(() => {
    let interval = setInterval(() => {      
      setData((statedata)=>{

        if (statedata.paused===false) {

          /////////// advance simulation ///////////
          let network = statedata.network;
          let time = statedata.time;
          
          // reset network at beginning
          if (time === 0) {
            network = initial_data
          } 
          // at end of simulation
          else if (time === events.length) {
            // if continuous_play, keep going
            if (continuous_play) {
              return {
                network: initial_data,
                time:0,
                paused:false
              }
            }
            //pause simulation and reset time to zero
            return {
              network: network,
              time: time,
              paused: true
            }
          }

          //set events list
          let events_list;
          if (events.length>0){
            events_list = events[time%events.length];
          } else {
            events_list = []
          }
          
          //all events
          let nodes = network.nodes;
          let links = network.links;

          for (var e of events_list) {

            if (e.event_type === 'add_node') {
              nodes = [...nodes,e.node]
            } else if (e.event_type === 'remove_node'){
              nodes = nodes.filter((item: any)=>item.id !== e.id)
              links = links.filter((item: any)=>(item.source.id !== e.id && item.target.id !== e.id))
            } else if (e.event_type === 'add_link'){
              let source = nodes.find((n:any)=>(n.id === e.source))
              let target = nodes.find((n:any)=>(n.id === e.target))
              let newlink = {...e.attributes,source:source,target:target}
              links = [...links,newlink]
            } else if (e.event_type === 'remove_link'){
              //filter links
              links = links.filter((item:any)=>{
                if (item.source.id === e.source && item.target.id === e.target) {
                  return false
                }
                if (item.source.id === e.target && item.target.id === e.source) {
                  return false
                }
                return true
              });
            } else if(e.event_type=== 'node_attributes'){
              for (var n of nodes){
                if (n.id === e.id){
                  for (var propt in e.attributes){
                    n[propt]=e.attributes[propt]
                  }
                }
              }
            } else if(e.event_type === 'link_attributes'){

              //find link
              let link = links.find((item:any)=>{
                if ((item.source.id === e.source) && (item.target.id === e.target)){
                  return true
                }
                if (directed && item.source.id === e.target && item.target.id === e.source){
                  return true
                }
                return false
              });

              // add attributes to link
              for (var propt in e.attributes){
                link[propt]=e.attributes[propt]
              }
            } else if (e.event_type === 'new_graph'){
              nodes = e.graph.nodes;
              links = e.graph.links;
            }
          }

          //advance time 
          time++;
          
          return {
            network:{nodes:nodes, links:links},
            time:time,
            paused:statedata.paused
          };
        } else {
          return statedata;
        }
      });
      
    },time_interval,[statedata,events,initial_data]);
    return () => {
      clearInterval(interval);
    };
  },[statedata,events,time_interval,initial_data,continuous_play]);

  let simulation_panel = <>
    <Button onClick={playpause} variant={"light"}>{statedata.paused ? <Play/> : <Pause/>}</Button>
    <Button onClick={reset} variant={'light'}><ArrowCounterclockwise/></Button>
    <p>{statedata.time}/{events.length}</p>
  </>

  // Add a label and pass min/max variables to the baseui Slider
  return (
    <>
      {events.length > 0 ? simulation_panel : <></>}
      <ForceGraph2D graphData={statedata.network} {...graphprops}/>
    </>
  );
};

export default withStreamlitConnection(Graph);