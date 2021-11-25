import os
import streamlit.components.v1 as components

from .forcegraphsimulation import ForceGraphSimulation

# Create a function _component_func which will call the frontend component when run
use_build = True
if use_build:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func_graph = components.declare_component("new_component_name", path=build_dir)
else:
    _component_func_graph = components.declare_component("graph",url="http://localhost:3001")

# Define a public function for the package,
# which wraps the caller to the frontend code

def st_graph(data: dict,events:list, time_interval:int =100, graphprops:dict = {}, key:str='graph'):
    component_value = _component_func_graph(
        data=data,
        events=events,
        time_interval=time_interval,
        graphprops=graphprops,
        key=key
    )
    return component_value