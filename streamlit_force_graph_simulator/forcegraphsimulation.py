
import networkx as nx
from networkx import Graph
from networkx.readwrite import json_graph

class ForceGraphSimulation:

    """ForceGraphSimulation is a wrapper class for networkx `Graph` objects, 
    designed to assist in the creation of a `streamlit_force_graph_simulator` 
    component. When simulating networks,

    Contains an underlying networkx graph.

    Args:
        initial_graph: a networkx `Graph` object to be wrapped

    Attributes:
        graph: the underlying networkx `Graph` object
        events: a list of events, where each element in the list is itself
            a list of events that occur. 
        
    Methods:
        add_node()
        add_edge()
        remove_node()
        remove_edge()
        set_node_attributes()
        set_edge_attributes()
    """

    def __init__(self, initial_graph):

        self.graph = initial_graph
        self.initial_graph_json = json_graph.node_link_data(initial_graph)
        self.is_directed = initial_graph.is_directed()

        self._current_event = []
        self._events = []


    def save_event(self):

        """Create a new event. All events added to the function since
        previous calls to this function will be wrapped in a single
        list and added to the global events list.
        """

        self._events.append(self._current_event)
        self._current_event = []

    def _add_node_event(self,nodeID,**kwargs):

        """Add node to network, log event.
        
        Args:
            nodeID
        Optional Args:
            **kwargs: any node attribute
        """

        e = {}
        e['event_type'] = 'add_node'
        e['node'] = {'id':nodeID}
        
        for k,v in kwargs.items():
            e['node'][k]=v

        self._current_event.append(e)

    def _remove_node_event(self,nodeID):

        """Remove node from network, log event.
        
        Args:
            nodeID
        """

        e = {}
        e['event_type'] = 'remove_node'
        e['id'] = nodeID

        self._current_event.append(e)


    def _node_attributes_event(self,nodeID,**kwargs):

        """Change node attributes, log event.
        
        Args:
            nodeID
        Optional Args:
            kwargs: any node attribute
        """

        e = {}
        e['event_type'] = 'node_attributes'
        e['id'] = nodeID
        e['attributes'] = kwargs

        self._current_event.append(e)


    def _add_link_event(self,source,target,**kwargs):
        
        """Add edge to network, log event."""

        e = {}
        e['event_type'] = 'add_link'
        e['source'] = source
        e['target'] = target
        e['attributes'] = kwargs
        
        self._current_event.append(e)

    def _remove_link_event(self,source,target):

        """Remove link from network, log event.
        
        Args:
            source: the source node of the edge
            target: the target node of the edge
        """

        e = {}
        e['event_type'] = 'remove_link'
        e['directed'] = self.is_directed
        e['source'] = source
        e['target'] = target
        
        self._current_event.append(e)


    def _link_attributes_event(self,source,target,**kwargs):
        
        """Change link attributes, log event.
        
        Args:
            source: the source node of the edge
            target: the target node of the edge
        Optional Args:
            kwargs: any valid link argument
        """

        e = {}
        e['event_type'] = 'link_attributes'
        e['source'] = source
        e['target'] = target
        e['attributes'] = kwargs
        
        self._current_event.append(e)


    def add_node(self,node,**attr):

        """Add node to network and log event."""

        self._add_node_event(node,**attr)
        self.graph.add_node(node,**attr)


    def remove_node(self,node):

        """Remove node from network and log event."""

        self._remove_node_event(node)
        self.graph.remove_node(node)


    def set_node_attributes(self,node,**attr):

        """Set node attributes and log event."""

        self._node_attributes_event(node,**attr)
        nx.set_node_attributes(self.graph, {node:attr})


    def add_edge(self,source,target,**attr):

        """Add edge and log event.
        
        Args:
            source: the source node of the edge
            target: the target node of the edge
        Optional Args:
            kwargs: any valid edge attribute
        """

        self._add_link_event(source,target,**attr)
        self.graph.add_edge(source,target,**attr)


    def remove_edge(self,source,target):

        """Remove edge and log event.
        
        Args:
            source: the source node of the edge
            target: the target node of the edge
        """

        self._remove_link_event(source,target)
        self.graph.remove_edge(source,target)


    def set_edge_attributes(self,source,target,**attr):

        """Set edge attributes and log event.
        
        Args:
            source: the source node of the edge
            target: the target node of the edge
        Optional Args:
            kwargs: any valid edge argument
        """

        self._link_attributes_event(source,target,**attr)
        nx.set_edge_attributes(self.graph,{(source,target):attr})

    @property
    def events(self):

        """All events, as a list of lists. Each event is itself a list
        of one or more 'events' that will modify the network."""

        return self._events
