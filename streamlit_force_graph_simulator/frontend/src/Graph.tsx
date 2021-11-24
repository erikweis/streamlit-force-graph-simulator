import React, { useEffect,useCallback, useState } from "react";
import {
  ComponentProps,
  Streamlit,
  withStreamlitConnection,
} from "streamlit-component-lib";
import ForceGraph2D from 'react-force-graph-2d';
import { runInThisContext } from "vm";
import { setConstantValue } from "typescript";

const Graph = (props: ComponentProps) => {
  /**
   * Destructuring JSON objects is a good habit.
   * This will look for label, minValue and maxValue keys
   * to store them in separate variables.
   */
  const {data, events, time_interval, graphprops} = props.args;

  let time=0;
  let initial_data = { nodes:data.nodes, links:data.links }
  const [statedata, setData] = useState({network:initial_data,time:time});

  useEffect(() => Streamlit.setFrameHeight());

  useEffect(() => {
    let interval = setInterval(() => {      
      setData((statedata)=>{
        let network = statedata.network;
        let time = statedata.time;
        
        if (time%events.length === 0) {
          network = initial_data
        }

        let nodes = network.nodes;
        let links = network.links;

        //set events list
        let events_list;
        if (events.length>0){
          events_list = events[time%events.length];
        } else {
          events_list = []
        }

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
              let length_before = links.length;
              links = links.filter((link:any)=>{
                if ((link.source.id === e.source) && (link.target.id === e.target)) {
                  return false
                } else if ((link.source.id == e.target) && (link.target.id === e.source)){
                  return false
                } else {
                  return true
                }
              });
              //console.log(links.length-length_before);
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

        time++;
        //console.log(time)
        let new_data = {
          nodes:nodes, 
          links:links
        };

        return {network:new_data,time:time};
      });
      
    },time_interval,[statedata,events,initial_data]);
    return () => {
      clearInterval(interval);
    };
  },[statedata,events,time_interval,initial_data]);


  // Add a label and pass min/max variables to the baseui Slider
  return (
    <>
        <ForceGraph2D
            graphData={statedata.network}
            {...graphprops}
        />
    </>
  );
};

export default withStreamlitConnection(Graph);