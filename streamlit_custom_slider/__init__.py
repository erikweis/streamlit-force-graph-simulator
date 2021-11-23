import os
import streamlit.components.v1 as components


# Create a function _component_func which will call the frontend component when run
# _component_func = components.declare_component(
#     "custom_slider",
#     url="http://localhost:3001",  # Fetch frontend component from local webserver
# )

_component_func_graph = components.declare_component(
    "graph",
    url="http://localhost:3001"
)

# Define a public function for the package,
# which wraps the caller to the frontend code
# def st_custom_slider(label: str, min_value: int, max_value: int, key:str):
#     component_value = _component_func(label=label, minValue=min_value, maxValue=max_value,key=key)
#     return component_value

def st_graph(data: dict,events:list, key:str):
    component_value = _component_func_graph(data=data,events=events,key=key)
    return component_value