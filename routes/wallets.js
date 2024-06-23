const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const Users = require("../models/User");
const Tickets = require("../models/Ticket");
const Trains = require("../models/Train");
const Stations = require("../models/Station");
const Routes = require("../models/Route");
const Wallets = require("../models/Wallet");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


router.get("/api/wallets/:wallet_id", async (req, res) => {
    try {
        const walletId = req.params.wallet_id;
        const wallet = await Wallets.findOne({wallet_id: walletId});
        if (wallet) {
            res.status(200).json({
                wallet_id: wallet.wallet_id,
                balance: wallet.balance,
                wallet_user: {
                    user_id: wallet.wallet_user.user_id,
                    user_name: wallet.wallet_user.user_name
                }
            })
        }else {
            res.status(404).json({
                message: `wallet with id: ${walletId} was not found`
            });
        }
    } catch (err) {

    }
});

router.put("/api/wallets/:wallet_id", async (req,res) => {
    try {
        const { wallet_id } = req.params;
        const { recharge } = req.body;
        if (recharge < 100 || recharge > 10000) {
            return res.status(400).json({ message: `invalid amount: ${recharge}` });
        }
        let wallet = await Wallets.findOne({ wallet_id });
        if (!wallet) {
            res.status(404).json({ message: `wallet with id: ${wallet_id} was not found` });
        }
        else {
            wallet.balance += recharge;
            await wallet.save();
            res.status(200).json({
                wallet_id: wallet.wallet_id,
                wallet_balance: wallet.balance,
                wallet_user: {
                    user_id: wallet.wallet_user.user_id,
                    user_name: wallet.wallet_user.user_name
                }
            });
        }
    } catch (err) {

    }
});

class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(data, priority) {
        const newNode = { data, priority };
        this.heap.push(newNode);
        this.bubbleUp();
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        const node = this.heap[index];

        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];

            if (node.priority >= parent.priority) break;

            this.heap[parentIndex] = node;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }

    dequeue() {
        const min = this.heap[0];
        const end = this.heap.pop();

        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }

        return min;
    }

    sinkDown() {
        let index = 0;
        const length = this.heap.length;
        const node = this.heap[0];

        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.priority < node.priority) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild.priority < node.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) break;

            this.heap[index] = this.heap[swap];
            this.heap[swap] = node;
            index = swap;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

const dijkstra = (graph, startNode, endNode, optimize) => {
    const distances = {};
    const visited = {};
    const previous = {};
    const priorityQueue = new PriorityQueue();
  
    for (let node in graph) {
      distances[node] = Infinity;
      previous[node] = null;
    }
  
    distances[startNode] = 0;
  
    priorityQueue.enqueue(startNode, 0);
  
    while (!priorityQueue.isEmpty()) {
      const currentNode = priorityQueue.dequeue().data;
      const currentNeighbors = graph[currentNode];
  
      for (let neighbor in currentNeighbors) {
        let newDistance;
  
        if (optimize === 'cost') {
          newDistance = distances[currentNode] + currentNeighbors[neighbor].cost;
        } else {
          newDistance = distances[currentNode] + currentNeighbors[neighbor].time;
        }
  
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = currentNode;
          priorityQueue.enqueue(neighbor, newDistance);
        }
      }
  
      visited[currentNode] = true;
    }
  
    let shortestPath = [endNode];
    let current = endNode;
  
    while (current !== startNode) {
      shortestPath.unshift(previous[current]);
      current = previous[current];
    }
  
    return shortestPath;
  };

  const calculateOptimalRoute = async (from, to, optimize) => {
    const stations = await Stations.find({});
    const trains = await Trains.find({});
    const routes = await Routes.find({});
  
    const graph = {};
  
    // Populate graph with station connections
    stations.forEach(station => {
      graph[station.station_id] = {};
    });
  
    routes.forEach(route => {
      const { from_station, to_station, total_cost, total_time } = route;
      graph[from_station][to_station] = {
        cost: total_cost,
        time: total_time,
      };
    });
  
    const shortestPath = dijkstra(graph, from, to, optimize);
  
    return shortestPath;
  };


router.get("/api/routes", async (req,res) => {
    const {from, to, optimize} = req.query;
    try {
        const optimalRoute = await calculateOptimalRoute(parseInt(from), parseInt(to), optimize);
        if (optimalRoute) {
            res.status(200).json({
                optimalRoute,
              });
        }else {
            res.status(403).json({
                message: `no routes available from station: ${from} to station: ${to}`
            });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/api/tickets", async (req,res) => {
    try {
        const {wallet_id, time_after, station_from, station_to} = req.body;
        const optimalRoute = calculateOptimalRoute(station_from, station_to,"cost");
        if (optimalRoute.length === 0) {
            return res.status(403).json({
                message: `no ticket available for station: ${station_from} to station:
                ${station_to}`
            });
        }
        const overalCost = optimalRoute[optimalRoute.length - 1].cost;
        if (overalCost.length) {
            return res.status(402).json({
                message: `recharge amount: ${overalCost} to purchase the ticket`
            })
        }
        const wallet = await Wallets.findOne({wallet_id: wallet_id});
        const ticket = new Tickets({
            balance: wallet.balance,
            wallet_id: wallet.wallet_id,
            stations: [
                {
                    optimalRoute: optimalRoute
                }
            ]
        });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (err) {
        
    }
});

module.exports = router;