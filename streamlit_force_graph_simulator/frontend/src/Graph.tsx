import React, { useEffect, useState } from "react";
import {
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";
import ForceGraph2D from 'react-force-graph-2d';
import Button from "react-bootstrap/Button";
//import { ProgressBar } from "react-bootstrap";
import { Play, Pause,ArrowCounterclockwise} from 'react-bootstrap-icons';


const Graph = (props: ComponentProps) => {

  const {initial_graph, events, time_interval, graphprops} = props.args;

  let time=0;
  let initial_data = { nodes:initial_graph.nodes, links:initial_graph.links }
  const [statedata, setData] = useState({network:initial_data,time:time,paused:true});

  useEffect(() => Streamlit.setFrameHeight());

  let playpause = () => {
    setData((statedata)=>{
      
      // network should be reset if pressing play after previous simulation finished
      var network;
      if (statedata.time === 0) {
        network = initial_data
      } else {
        network = statedata.network
      }

      return {
        network:network,
        time:statedata.time,
        paused: !statedata.paused
      }
    })
  };

  let reset = () => {
    setData((statedata)=>{
      return {
        network:initial_data,
        time:0,
        paused:true
      }
    })
  }

  useEffect(()=>{
    setData({network:initial_graph,time:0,paused:true})
  },[props]);

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
          // at end of simulation pause simulation and reset time to zero
          else if (time === events.length) {
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
            } else if (e.event_type === 'add_link'){
              let source = nodes.find((n:any)=>(n.id === e.source))
              let target = nodes.find((n:any)=>(n.id === e.target))
              let newlink = {...e.attributes,source:source,target:target}
              links = [...links,newlink]
            } else if (e.event_type === 'remove_link'){
              if (e.directed === 'true'){
                links = links.filter((item:any)=>((item.source.id !== e.source) && (item.target.id !== e.target)))
              } else {
                links = links.filter((link:any)=>{
                  if ((link.source.id === e.source) && (link.target.id === e.target)) {
                    return false
                  } else if ((link.source.id === e.target) && (link.target.id === e.source)){
                    return false
                  } else {
                    return true
                  }
                });
              }
            } else if(e.event_type=== 'node_attributes'){
              for (var n of nodes){
                if (n.id === e.id){
                  for (var propt in e.attributes){
                    n[propt]=e.attributes[propt]
                  }
                }
              }
            } else if(e.event_type === 'link_attributes'){
              let link = links.find((item:any)=>((item.source.id === e.source) && (item.target.id === e.target)))
              for (var propt in e.attributes){
                link[propt]=e.attributes[propt]
              }
            } else if (e.event_type === 'new_graph'){
              //console.log(e.graph)
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
  },[statedata,events,time_interval,initial_data]);

  // play pause button
  let button = <Button onClick={playpause} variant={"light"}>{statedata.paused ? <Play/> : <Pause/>}</Button>
  let resetbtn = <Button onClick={reset} variant={'light'}><ArrowCounterclockwise/></Button>

  // Add a label and pass min/max variables to the baseui Slider
  return (
    <>
      {button}
      {resetbtn}
      <p>{statedata.time}/{events.length}</p>
      <ForceGraph2D
          graphData={statedata.network}
          {...graphprops}
      />
    </>
  );
};

export default withStreamlitConnection(Graph);