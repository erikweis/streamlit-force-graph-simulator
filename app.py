from networkx.generators.social import les_miserables_graph
import streamlit.components.v1 as components  # Import Streamlit

# Render the h1 block, contained in a frame of size 200x200.
#components.html("<html><body><h1>Hello, World</h1></body></html>", width=200, height=200)

# Import the wrapper function from your package
from streamlit_force_graph_simulator import st_graph, ForceGraphSimulation
import streamlit as st

import json
import networkx as nx
from networkx.readwrite import json_graph
import time
import random

st.title("My Streamlit App")

# Store and display the return value of your custom component
# label = st.sidebar.text_input('Label', 'Hello world')
# min_value, max_value = st.sidebar.slider("Range slider", 0, 100, (0, 50))

# v = st_custom_slider(label=label, min_value=min_value, max_value=max_value,key="slider")
# st.write(v)

# G = nx.les_miserables_graph()

# group = {}
# for node in G.nodes:
#     group[node]= random.choice([1,2])

# nx.set_node_attributes(G,group,'group')
# data = json_graph.node_link_data(G)

#G = nx.erdos_renyi_graph(5,0.8)
G = nx.les_miserables_graph()
print(nx.is_connected(G))
for node in G.nodes:
    G.nodes[node]['color'] = random.choice(['red','blue'])
data = json_graph.node_link_data(G)

####### change graphs completely
# graphs = [data]
# for i in range(20):
#     new_node = G.number_of_nodes()
#     new_edge_connections = [(new_node, other) for other in random.sample(G.nodes,3)]
#     G.add_node(new_node)
#     G.add_edges_from(new_edge_connections)

#     graphs.append(json_graph.node_link_data(G))


def remove_link_event(source,target,directed=False):
    e = {}
    e['event_type'] = 'remove_link'
    e['directed'] = directed
    e['source'] = source
    e['target'] = target
    return e

def add_node_event(nodeID,**kwargs):
    
    e = {}
    e['event_type'] = 'add_node'
    e['node'] = {'id':nodeID}
    
    for k,v in kwargs.items():
        e['node'][k]=v

    return e


def add_link_event(source,target,**kwargs):
    
    e = {}
    e['event_type'] = 'add_link'
    e['source'] = source
    e['target'] = target
    e['attributes'] = kwargs
    return e


def remove_node_event(nodeID):
    e = {}
    e['event_type'] = 'remove_node'
    e['id'] = nodeID

    return e


def node_attributes_event(nodeID,**kwargs):

    e = {}
    e['event_type'] = 'node_attributes'
    e['id'] = nodeID
    e['attributes'] = kwargs

    return e


def link_attributes_event(source,target,**kwargs):
    
    e = {}
    e['event_type'] = 'link_attributes'
    e['source'] = source
    e['target'] = target
    e['attributes'] = kwargs
    
    return e

# with open("les_miserables.json") as f:
#     les_mis_graph = json.load(f)

# if 'graph_data' not in st.session_state:
#     st.session_state.initial_data = data 

# w = st_graph(data = st.session_state.graph_data,key="graph")
# st.write(w)



#change colors
events = []
for _ in range(100):
    print(_)
    node = random.choice(list(G.nodes))
    neighbors = list(G[node])
    try:
        assert len(neighbors)
    except:
        print(node, list(G.neighbors(node)))
    node_color = G.nodes[node]['color']
    if random.random() < 0.1:
        if neighbors:
            neighbor = random.choice(neighbors)
            neighbor_color = G.nodes[neighbor]['color']
            G.nodes[node]['color'] = neighbor_color
            events.append([node_attributes_event(node,color=neighbor_color)])

    else:
        opp_neighbors = [n for n in neighbors if G.nodes[n]['color'] != G.nodes[node]['color'] ]
        if opp_neighbors:
            old_neighbor = random.choice(opp_neighbors)

            # choices = list(nx.ego_graph(G,node,radius=2,center=False).nodes)
            choices = list(G.nodes)
            choices.remove(node)
            new_neighbor = random.choice(choices)
            events.append([remove_link_event(node,old_neighbor),\
                add_link_event(node,new_neighbor)])
            G.add_edge(node,new_neighbor)
            G.remove_edge(node,old_neighbor)



#events = [[{'event_type':'new_graph','graph':g}] for g in graphs]

w = st_graph(data,events, key="graph")
st.write(w)

# def color_callback():

#     for node in G.nodes:
#         if random.random() <0.1:
#             G.nodes[node]['group']=random.choice([0,1])
#     st.session_state.initial_data = json_graph.node_link_data(G)


# st.sidebar.button('Run Simulation',key='button',on_click=color_callback)



# st.write(st_graph(data=data,key="graph"))