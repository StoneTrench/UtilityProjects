import { create } from 'xmlbuilder2';

export type GraphEdge<T> = {
    from: string;
    to: string;
    data: T;
}

export type GraphNode<T> = {
    id: string;
    type: GraphType;
    data: T;
}

export type GraphType = string | number | boolean;

export class GraphNetwork<TNode, TEdge> {
    private nodes: Map<string, GraphNode<TNode>>;
    private outgoingEdges: Map<string, GraphEdge<TEdge>[]>;
    private incomingEdges: Map<string, GraphEdge<TEdge>[]>;
    private allowSameConnections: boolean;

    constructor(allowSameConnections: boolean = false) {
        this.nodes = new Map();
        this.outgoingEdges = new Map();
        this.incomingEdges = new Map();
        this.allowSameConnections = allowSameConnections;
    }

    addNode(id: string, type: GraphType, data: TNode) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, type, data });
            this.outgoingEdges.set(id, []);
            this.incomingEdges.set(id, []);
        }
        return this;
    }

    addEdge(from: string, to: string, data: TEdge) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            throw new Error("Both nodes must exist in the network!");
        }

        const fromNode = this.nodes.get(from)!;
        const toNode = this.nodes.get(to)!;

        if (!this.allowSameConnections && fromNode.type === toNode.type) {
            throw new Error("Nodes of the same type cannot be connected to each other!");
        }

        const outgoingEdges = this.outgoingEdges.get(from)!;
        if (outgoingEdges.some(edge => edge.to === to && edge.data === data)) {
            return; // Edge already exists
        }

        const newEdge: GraphEdge<TEdge> = { from, to, data };
        outgoingEdges.push(newEdge);
        this.incomingEdges.get(to)!.push(newEdge);
        return this;
    }

    removeEdge(from: string, to: string) {
        if (this.outgoingEdges.has(from)) {
            this.outgoingEdges.set(
                from,
                this.outgoingEdges.get(from)!.filter(edge => edge.to !== to)
            );
        }
        if (this.incomingEdges.has(to)) {
            this.incomingEdges.set(
                to,
                this.incomingEdges.get(to)!.filter(edge => edge.from !== from)
            );
        }
        return this;
    }

    removeNode(id: string) {
        this.nodes.delete(id);
        this.outgoingEdges.delete(id);
        this.incomingEdges.delete(id);

        this.outgoingEdges.forEach((edges, nodeId) => {
            this.outgoingEdges.set(
                nodeId,
                edges.filter(edge => edge.to !== id)
            );
        });

        this.incomingEdges.forEach((edges, nodeId) => {
            this.incomingEdges.set(
                nodeId,
                edges.filter(edge => edge.from !== id)
            );
        });
        return this;
    }

    getNode(id: string): GraphNode<TNode> | undefined {
        return this.nodes.get(id);
    }

    getOutgoingNeighbors(id: string): GraphEdge<TEdge>[] | undefined {
        return this.outgoingEdges.get(id);
    }

    getIncomingNeighbors(id: string): GraphEdge<TEdge>[] | undefined {
        return this.incomingEdges.get(id);
    }

    printNetwork() {
        this.nodes.forEach((node, id) => {
            const outgoingEdges = this.outgoingEdges.get(id)!;
            const outgoingEdgesStr = outgoingEdges.map(edge => `${edge.to} (data: ${(edge.data.toString ? edge.data.toString() : edge.data)})`).join(', ');
            console.log(`${node.type} ${id} -> ${outgoingEdgesStr}`);

            const incomingEdges = this.incomingEdges.get(id)!;
            const incomingEdgesStr = incomingEdges.map(edge => `${edge.from} (data: ${(edge.data.toString ? edge.data.toString() : edge.data)})`).join(', ');
            console.log(`   <- ${incomingEdgesStr}`);
        });
        return this;
    }

    serialize() {
        return {
            nodes: Array.from(this.nodes.entries()),
            outgoingEdges: Array.from(this.outgoingEdges.entries()),
            incomingEdges: Array.from(this.incomingEdges.entries()),
            allowSameConnections: this.allowSameConnections
        };
    }

    // Deserialization
    static deserialize<TNode, TEdge>(obj: any): GraphNetwork<TNode, TEdge> {
        const res = new GraphNetwork<TNode, TEdge>();

        res.nodes = new Map(obj.nodes);
        res.outgoingEdges = new Map(obj.outgoingEdges);
        res.incomingEdges = new Map(obj.incomingEdges);
        res.allowSameConnections = obj.allowSameConnections

        return res;
    }

    exportToGraphML() {
        const doc = create({ version: '1.0', encoding: 'UTF-8', standalone: false })
            .ele('graphml', {
                xmlns: 'http://graphml.graphdrawing.org/xmlns',
                'xmlns:java': 'http://www.yworks.com/xml/yfiles-common/1.0/java',
                'xmlns:sys': 'http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0',
                'xmlns:x': 'http://www.yworks.com/xml/yfiles-common/markup/2.0',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                'xmlns:y': 'http://www.yworks.com/xml/graphml',
                'xmlns:yed': 'http://www.yworks.com/xml/yed/3',
                'xsi:schemaLocation': 'http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd'
            })
            .ele('key', { id: 'd0', 'for': 'port', 'yfiles.type': 'portgraphics' }).up()
            .ele('key', { id: 'd1', 'for': 'port', 'yfiles.type': 'portgeometry' }).up()
            .ele('key', { id: 'd2', 'for': 'port', 'yfiles.type': 'portuserdata' }).up()
            .ele('key', { id: 'd3', 'attr.name': 'url', 'attr.type': 'string', 'for': 'node' }).up()
            .ele('key', { id: 'd4', 'attr.name': 'description', 'attr.type': 'string', 'for': 'node' }).up()
            .ele('key', { id: 'd5', 'for': 'node', 'yfiles.type': 'nodegraphics' }).up()
            .ele('key', { id: 'd6', 'for': 'graphml', 'yfiles.type': 'resources' }).up()
            .ele('key', { id: 'd7', 'attr.name': 'url', 'attr.type': 'string', 'for': 'edge' }).up()
            .ele('key', { id: 'd8', 'attr.name': 'description', 'attr.type': 'string', 'for': 'edge' }).up()
            .ele('key', { id: 'd9', 'for': 'edge', 'yfiles.type': 'edgegraphics' }).up()
            .ele('key', { id: 'd10', "yfiles.type": "edgegraphics", 'for': 'edge' }).up()
            .ele('graph', { id: 'G', edgedefault: 'directed' })


        // Add nodes
        this.nodes.forEach((node, id) => {
            const label: string = node.data["label"] ?? ""

            const lines = label.split("\n");

            const nodeWidth = lines.reduce((a, b) => a.length > b.length ? a : b).length * 6 + 30;
            const nodeHeight = lines.length * 16 + 30;

            doc.ele('node', { id: node.id }) // no up
                .ele('data', { key: 'd4' }).txt(node.type.toString()).up()
                .ele('data', { key: 'd5' }) // no up
                .ele(`y:ShapeNode`) // no up
                .ele(`y:Geometry`, { height: `${nodeHeight}`, width: `${nodeWidth}`, x: "0.0", y: "0.0" }).up()
                .ele(`y:NodeLabel`).txt(label).up()
                .ele(`y:Shape`, { type: node.data["shape"] }).up() // <y:Shape type="hexagon"/>
                .up()
                .up()
                .up()
        });

        // Add edges
        this.outgoingEdges.forEach((edges, from) => {
            edges.forEach(edge => {
                doc.ele('edge', { source: edge.from, target: edge.to }) // no up
                    .ele('data', { key: 'd10' }) // no up
                    .ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" }) // no up
                    .ele("y:LineStyle", { color: "#000000", type: "line", width: "3.0" }).up()
                    .ele("y:Arrows", { source: "none", target: "standard" }).up()
                    .ele("y:EdgeLabel").txt(edge.data["label"]).up()
                    .up()
                    .up()
                    .up()
            });
        });

        doc.up().ele("data", { key: "d6" }).ele("y:Resources").up().up()

        return doc.end({ prettyPrint: true });
    }
}
/**

<edge id="e2" source="n1" target="n3">
      <data key="d10">
        <y:GenericEdge configuration="com.yworks.edge.framed">
          <y:Path sx="46.0" sy="-15.0" tx="37.5" ty="15.0">
            <y:Point x="254.25" y="348.5"/>
            <y:Point x="263.75" y="348.5"/>
            <y:Point x="263.75" y="159.5"/>
            <y:Point x="247.25" y="159.5"/>
          </y:Path>
          <y:LineStyle color="#000000" type="line" width="3.0"/>
          <y:Arrows source="none" target="standard"/>
          <y:EdgeLabel alignment="center" configuration="AutoFlippingLabel" distance="2.0" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.701171875" horizontalTextPosition="center" iconTextGap="4" modelName="custom" preferredPlacement="anywhere" ratio="0.5" textColor="#000000" verticalTextPosition="bottom" visible="true" width="39.361328125" x="10.3193359375" xml:space="preserve" y="-21.693359375">Heugh<y:LabelModel><y:SmartEdgeLabelModel autoRotationEnabled="false" defaultAngle="0.0" defaultDistance="10.0"/></y:LabelModel><y:ModelParameter><y:SmartEdgeLabelModelParameter angle="0.0" distance="30.0" distanceToCenter="true" position="right" ratio="0.5" segment="0"/></y:ModelParameter><y:PreferredPlacementDescriptor angle="0.0" angleOffsetOnRightSide="0" angleReference="absolute" angleRotationOnRightSide="co" distance="-1.0" frozen="true" placement="anywhere" side="anywhere" sideReference="relative_to_edge_flow"/></y:EdgeLabel>
        </y:GenericEdge>
      </data>
    </edge>



    <node id="n6">
      <data key="d4"/>
      <data key="d5">
        <y:ShapeNode>
          <y:Geometry height="30.0" width="106.0" x="29.0" y="0.0"/>
          <y:Fill color="#FFCC00" transparent="false"/>
          <y:BorderStyle color="#000000" raised="false" type="line" width="1.0"/>
          <y:NodeLabel alignment="center" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.701171875" horizontalTextPosition="center" iconTextGap="4" modelName="custom" textColor="#000000" verticalTextPosition="bottom" visible="true" width="87.384765625" x="9.3076171875" xml:space="preserve" y="5.6494140625">
            crushing_wheel
            <y:LabelModel>
                <y:SmartNodeLabelModel distance="4.0"/>
            </y:LabelModel>
            <y:ModelParameter>
                <y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/>
            </y:ModelParameter>
          </y:NodeLabel>
          <y:Shape type="rectangle"/>
        </y:ShapeNode>
      </data>
    </node>

    
  </graph>
  <data key="d6">
    <y:Resources/>
  </data>
</graphml>
 */