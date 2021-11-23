import os
import streamlit.components.v1 as components

from .forcegraphsimulation import ForceGraphSimulation

# Create a function _component_func which will call the frontend component when run

_component_func_graph = components.declare_component(
    "graph",
    url="http://localhost:3001"
)

# Define a public function for the package,
# which wraps the caller to the frontend code

def st_graph(data: dict,events:list, key:str):
    component_value = _component_func_graph(data=data,events=events,key=key)
    return component_value