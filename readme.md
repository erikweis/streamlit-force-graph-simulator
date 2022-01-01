# streamlit-force-graph-simulator

Useful for animating dynamic networks using d3 force-directed graph from a purely python interface. Streamlit handles the interace between python and javascript automatically, and apps can be deployed automatically with a very little boilerplate.

# installation

To install, run

```{python}
pip install streamlit-force-graph-simulator
```
You will also need `networkx`.

# usage

To use this component in your streamlit app, you will need the following import statement

```{python}
from streamlit_force_graph_simulator import st_graph
```

The component `st_graph` has takes the following arguments:

| Arg | Type | Default | Description |
| --- | :--: | :--: | --- |
| <b>initial_graph</b> | dict | (required) | A standard json formatted graph object, which requires 'nodes' and 'links' as keys. This format can be optained from a networkx graph using the method `networkx.readwrite.json_graph.node_link_data`. |
| <b>events</b> | list | `[]` | Each event is itself a list of modifications to the graph at this time step. These events are each dictionaries with relevant information (e.g. `{'event_type':'add_node'.'node':{'id':3,'color':'red'} }`). The specifics of these events are described below.| 
| <b>time_interval</b> | int | `100` | Time in milliseconds between each event.
| <b>graph_props</b>| dict | `{}` | Any graph-level props that can be passed to a [react-force-graph](https://github.com/vasturiano/react-force-graph#api-reference) object. |
| <b>directed</b>| dict | `False` | Determines whether link operations (remove or attribute update events) are order-dependent.|
| <b>continuous_play</b> | bool | `False` | Simulation will restart automatically when it finishes.|
| <b>key</b>| str | `'graph'` | A unique identifier for each component. When using multiple components instances, use a unique identifier for each one.|

## event types

| event_type | args |
| --- | --- |
| <b>add_node</b> | <ul><li>`node` (<i>dict</i>): json style node object which must include an `id` and any other node properties allowed in node properties [react-force-graph](https://github.com/vasturiano/react-force-graph#api-reference)</li> </ul>|
| <b>remove_node</b> | <ul><li>`nodeID` (<i>str, int</i>): ID of the node to remove</li> </ul>|
| <b>node_attribues</b> | <ul><li>`nodeID` (<i>str,int</i>): ID of the node to adjust</li><li> `attributes` (<i>dict</i>) all attributes to adjust or add. These must be allowed in node properties of [react-force-graph](https://github.com/vasturiano/react-force-graph#api-reference)</li></ul>|
| <b>add_link</b> | <ul><li>`source` (<i>str,int</i>): The source node ID (order doesn't matter if graph is undirected)</li> <li>`target`(<i>str,int</i>): The target node ID</li><li>`Attributes` (<i>dict</i>): Any allowed attributes of [react-force-graph](https://github.com/vasturiano/react-force-graph#api-reference)</li></ul>|
|<b>remove_link</b> | <ul><li>`source` (<i>str,int</i>): source node ID (order doesn't matter if graph is undirected)</li> <li>`target`(<i>str,int</i>): The target node ID</li></ul> |
|<b>link_attributes</b> | <ul><li>`source` (<i>str,int</i>): The source node ID (order doesn't matter if graph is undirected)</li> <li>`target`(<i>str,int</i>): The target node ID</li><li>`Attributes` (<i>dict</i>): attributes to update, any supported attributes of [react-force-graph](https://github.com/vasturiano/react-force-graph#api-reference)</li></ul> |
|<b>new_graph</b> | <ul><li>`graph`(<i>dict</i>): json graph format described above. This event completely replaces the graph. (Doing so may or may not preserve any location stored in the component state).</li> </ul>|

## creating a simulation with networkx graph wrapper

This package also includes a python object that can automatically assemble events as an underlying `networkx` `Graph` object is accessed. It can be used as follows:

```{python}
from streamlit_force_graph_simulator import ForceGraphSimulation
import network as nx

G = nx.erdos_renyi_graph(5,0.8,directed=True)
F = ForceGraphSimulation(G)

F.add_node(5)
F.add_edge(4,5)
F.add_edge(3,5)
F.save_event()

F.add_node(6)
F.add_edge(5,6)
F.save_event()

F.remove_node(5)
F.save_event()

props = {
    'height':300,
    'cooldownTicks':1000 ,
    'linkDirectionalArrowLength':3.5,
    'linkDirectionalArrowRelPos':1
}

st_graph(
    F.initial_graph_json,
    F.events,
    time_interval = 1000,
    graphprops=props,
    continuous_play = True,
    directed = True,
    key='my_graph'
)
```

The `ForceGraphSimulation` class applies has the following attributes and methods. The methods are written to align with `networkx` `Graph` methods, so `add_edge` is used in place of `add_link`.

### Attributes
| Attribute | Description |
| --- | --- |
|`events`|  all events |
|`initial_graph_json`| a json version of the initial graph |
|`graph`| the underlying networkx graph |

### Methods
| Method | Args | Returns | Description | 
| --- | --- | --- | --- |
| <b>save_event</b> | None | None | save all modifications to graph (since last call of this function) as a new event |
| <b>add_node</b> | <ul><li>`nodeID`: identifier of node </li> <li>`kwargs`: attributes of the node</li></ul> | None | add node to graph |
| <b>remove_node</b> | <ul><li>`nodeID`: identifier of node </li></ul> | None | Remove node from graph and all edges connected to the node |
| <b>set_node_attributes</b> | <ul><li>`nodeID`: identifier of node </li> <li>`kwargs`: attributes of the node</li></ul> | None | Modify node attributes | 
| <b>add_edge</b> | <ul><li>`source`: identifier of source node</li><li>`target`: indentifier of target node</li><li>`kwargs`: attributes of the edge</li></ul> | None | Add edge to the graph |
| <b>remove_edge</b> | <ul><li>`source`: identifier of source node</li><li>`target`: indentifier of target node</li></ul> | None | Remove edge from the graph |
| <b>set_edge_attributes</b> | <ul><li>`source`: identifier of source node</li><li>`target`: indentifier of target node</li><li>`kwargs`: attributes of the edge</li></ul> | None | Modify attributes of the edge |

## More complex simulations

Not all operations need to be done on the `ForceGraphSimulation` object directly. For complicated simulations, the underlying graph can be accessed and used as normal with the `graph` attribute. For example, consider the following code implementying an adaptive voter model.

```{python}
G = nx.les_miserables_graph()
for node in G.nodes:
    G.nodes[node]['color'] = random.choice(['red','blue'])

F = ForceGraphSimulation(G)

for _ in range(1000):

    #new event
    F.save_event()

    #choose node to act on
    node = random.choice(list(F.graph.nodes))

    #get neighbors
    neighbors = list(F.graph[node])

    #rewire or take a neighbor's state
    if random.random() < 0.3:

        #try to rewire a node with opposite opinion
        opp_neighbors = [n for n in neighbors if F.graph.nodes[n]['color'] != F.graph.nodes[node]['color'] ]
        if opp_neighbors:
            old_neighbor = random.choice(opp_neighbors)

            choices = list(F.graph.nodes)
            choices.remove(node)
            new_neighbor = random.choice(choices)
            F.add_edge(node,new_neighbor)
            F.remove_edge(node,old_neighbor)

    else:
        #take a neighbors state
        if neighbors:
            neighbor = random.choice(neighbors)
            neighbor_color = F.graph.nodes[neighbor]['color']
            if F.graph.nodes[node]['color'] != neighbor_color:
                F.set_node_attributes(node, color=neighbor_color)


st_graph(
    F.initial_graph_json,
    F.events,
    time_interval = 1000,
    graphprops=props,
    key='adaptive_voter_model'
)
```

To summarize, all simulations using `networkx` are possible with the `ForceGraphSimulation` object, but it's methods automatically keep track of the events list that must be passed along to the streamlit component.

# Suggestions and Comments

For bug reports, feel free to open an issue or contact me directly. For help using this component or any feature suggestions, feel free to reach out at [erik.weis@uvm.edu](). 