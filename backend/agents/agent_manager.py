"""
Agent Manager - Google Antigravity-style multi-agent orchestration
Manages agent lifecycle, communication, and parallel execution
"""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from dataclasses import dataclass, asdict
from enum import Enum

class AgentStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class AgentMessage:
    sender: str
    receiver: str
    content: Any
    timestamp: datetime
    message_type: str = "info"

@dataclass
class AgentTrace:
    agent_id: str
    timestamp: datetime
    action: str
    details: Dict[str, Any]
    status: str

class BaseAgent:
    """Base class for all agents in the system"""
    
    def __init__(self, agent_id: str, agent_manager):
        self.agent_id = agent_id
        self.agent_manager = agent_manager
        self.status = AgentStatus.IDLE
        self.message_queue = asyncio.Queue()
        self.trace_log: List[AgentTrace] = []
        self.tools = []
        
    async def initialize(self):
        """Initialize agent with required tools and configurations"""
        self._log_trace("initialize", {"status": "starting"})
        await self.setup_tools()
        self.status = AgentStatus.IDLE
        self._log_trace("initialize", {"status": "ready"})
        
    async def setup_tools(self):
        """Setup tools specific to this agent"""
        pass
        
    async def process(self, input_data: Any) -> Any:
        """Main processing method - to be overridden by subclasses"""
        raise NotImplementedError
        
    async def send_message(self, receiver: str, content: Any, message_type: str = "info"):
        """Send message to another agent"""
        message = AgentMessage(
            sender=self.agent_id,
            receiver=receiver,
            content=content,
            timestamp=datetime.now(),
            message_type=message_type
        )
        await self.agent_manager.route_message(message)
        self._log_trace("send_message", {"receiver": receiver, "type": message_type})
        
    async def receive_message(self, message: AgentMessage):
        """Receive message from another agent"""
        await self.message_queue.put(message)
        self._log_trace("receive_message", {"sender": message.sender, "type": message.message_type})
        
    def _log_trace(self, action: str, details: Dict[str, Any]):
        """Log agent action for traceability"""
        trace = AgentTrace(
            agent_id=self.agent_id,
            timestamp=datetime.now(),
            action=action,
            details=details,
            status=self.status.value
        )
        self.trace_log.append(trace)
        self.agent_manager.log_agent_trace(trace)

class AgentManager:
    """Central coordinator for multi-agent orchestration (Antigravity-style)"""
    
    def __init__(self):
        self.active_agents: Dict[str, BaseAgent] = {}
        self.message_bus: Dict[str, List[AgentMessage]] = {}
        self.global_trace: List[AgentTrace] = []
        self.execution_context: Dict[str, Any] = {}
        
    async def initialize(self):
        """Initialize all agents"""
        print("Initializing Agent Manager")
        
        # Import and initialize all agents
        from agents.signal_ingestion_agent import SignalIngestionAgent
        from agents.event_detection_agent import EventDetectionAgent
        from agents.reasoning_agent import ReasoningAgent
        from agents.action_planning_agent import ActionPlanningAgent
        from agents.dispatch_agent import DispatchAgent
        from agents.simulation_agent import SimulationAgent
        from agents.visualization_agent import VisualizationAgent
        
        # Create agent instances
        agents = [
            SignalIngestionAgent("signal_ingestion", self),
            EventDetectionAgent("event_detection", self),
            ReasoningAgent("reasoning", self),
            ActionPlanningAgent("action_planning", self),
            DispatchAgent("dispatch", self),
            SimulationAgent("simulation", self),
            VisualizationAgent("visualization", self)
        ]
        
        # Initialize all agents
        for agent in agents:
            await agent.initialize()
            self.active_agents[agent.agent_id] = agent
            self.message_bus[agent.agent_id] = []
            
        print(f"Initialized {len(self.active_agents)} agents")
        
    async def shutdown(self):
        """Shutdown all agents"""
        print("Shutting down Agent Manager")
        for agent_id, agent in self.active_agents.items():
            agent.status = AgentStatus.IDLE
        self.active_agents.clear()
        
    async def route_message(self, message: AgentMessage):
        """Route message between agents"""
        if message.receiver in self.active_agents:
            await self.active_agents[message.receiver].receive_message(message)
            self.message_bus[message.receiver].append(message)
        else:
            print(f"Unknown receiver: {message.receiver}")
            
    def _log_antigravity_trace(self, event_type: str, data: Dict):
        """Log explicit Antigravity-style state traces to filesystem"""
        import os
        import json
        from datetime import datetime
        
        trace_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "antigravity_traces")
        os.makedirs(trace_dir, exist_ok=True)
        
        trace_file_name = os.getenv("CIRO_TRACE_FILE", "sample_trace.json")
        trace_file = os.path.join(trace_dir, trace_file_name)
        
        trace_entry = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data
        }
        
        traces = []
        if os.path.exists(trace_file):
            try:
                with open(trace_file, "r") as f:
                    traces = json.load(f)
                    if not isinstance(traces, list):
                        traces = []
            except Exception:
                pass
                
        traces.append(trace_entry)
        traces = traces[-200:] # Limit log size to 200 to fit a full trace run
        
        try:
            with open(trace_file, "w") as f:
                json.dump(traces, f, indent=2)
        except Exception:
            pass
            
        print(f"[ANTIGRAVITY TRACE - {event_type.upper()}]: {json.dumps(data, indent=1)}")

    def log_agent_trace(self, trace: AgentTrace):
        """Log agent trace globally"""
        self.global_trace.append(trace)
        print(f"[{trace.timestamp.strftime('%H:%M:%S')}] {trace.agent_id}: {trace.action}")
        self._log_antigravity_trace("agent_action", {
            "agent_id": trace.agent_id,
            "action": trace.action,
            "details": trace.details
        })
        
    async def execute_workflow(self, workflow_name: str, input_data: Any) -> Dict[str, Any]:
        """Execute a multi-agent workflow"""
        print(f"\nExecuting workflow: {workflow_name}")
        workflow_start = datetime.now()
        
        # Generate explicit task plan (Antigravity-style goal planning)
        task_plan = {
            "goal": f"Crisis response: {workflow_name}",
            "steps": [
                {"agent": "signal_ingestion", "task": "Ingest and normalize multi-source signals"},
                {"agent": "event_detection", "task": "Spatial-temporal clustering of signals"},
                {"agent": "reasoning", "task": "Assess severity and humanitarian impact"},
                {"agent": "action_planning", "task": "Generate constrained resource allocation plan"},
                {"agent": "simulation", "task": "Simulate action outcomes and side-effects"},
                {"agent": "dispatch", "task": "Notify relevant authorities"},
                {"agent": "visualization", "task": "Push dynamic updates to dashboard"}
            ],
            "constraints": [
                "Total resources cannot exceed municipal inventory",
                "Confidence threshold >= 0.6 for autonomous dispatch",
                "Response time target < 15 minutes"
            ],
            "fallback": "If confidence < 0.6 or resources depleted, escalate to manual review"
        }
        
        self._log_antigravity_trace("task_plan_generated", task_plan)
        
        result = {
            "workflow": workflow_name,
            "start_time": workflow_start.isoformat(),
            "steps": [],
            "final_result": None,
            "task_plan": task_plan
        }
        
        try:
            self._log_antigravity_trace("workflow_execution_started", {"workflow": workflow_name})
            if workflow_name == "crisis_detection":
                result = await self._crisis_detection_workflow(input_data, result)
            elif workflow_name == "action_planning":
                result = await self._action_planning_workflow(input_data, result)
            elif workflow_name == "full_cycle":
                result = await self._full_cycle_workflow(input_data, result)
            else:
                raise ValueError(f"Unknown workflow: {workflow_name}")
                
            result["end_time"] = datetime.now().isoformat()
            result["duration_seconds"] = (datetime.now() - workflow_start).total_seconds()
            result["status"] = "completed"
            
        except Exception as e:
            result["status"] = "failed"
            result["error"] = str(e)
            print(f"Workflow failed: {e}")
            
        return result
        
    async def _crisis_detection_workflow(self, input_data: Dict, result: Dict) -> Dict:
        """Execute crisis detection workflow"""
        
        # Step 1: Signal Ingestion
        print("\nStep 1: Signal Ingestion")
        signal_agent = self.active_agents["signal_ingestion"]
        signal_agent.status = AgentStatus.RUNNING
        signals = await signal_agent.process(input_data)
        signal_agent.status = AgentStatus.COMPLETED
        result["steps"].append({"agent": "signal_ingestion", "output": signals})
        
        # Step 2: Event Detection
        print("\nStep 2: Event Detection")
        event_agent = self.active_agents["event_detection"]
        event_agent.status = AgentStatus.RUNNING
        events = await event_agent.process(signals)
        event_agent.status = AgentStatus.COMPLETED
        result["steps"].append({"agent": "event_detection", "output": events})
        
        # Step 3: Reasoning
        print("\nStep 3: Reasoning & Analysis")
        reasoning_agent = self.active_agents["reasoning"]
        reasoning_agent.status = AgentStatus.RUNNING
        analysis = await reasoning_agent.process(events)
        reasoning_agent.status = AgentStatus.COMPLETED
        result["steps"].append({"agent": "reasoning", "output": analysis})
        
        result["final_result"] = analysis
        return result
        
    async def _action_planning_workflow(self, input_data: Dict, result: Dict) -> Dict:
        """Execute action planning workflow"""
        
        # Action Planning
        print("\nStep 1: Action Planning")
        planning_agent = self.active_agents["action_planning"]
        planning_agent.status = AgentStatus.RUNNING
        actions = await planning_agent.process(input_data)
        planning_agent.status = AgentStatus.COMPLETED
        result["steps"].append({"agent": "action_planning", "output": actions})
        
        result["final_result"] = actions
        return result
        
    async def _full_cycle_workflow(self, input_data: Dict, result: Dict) -> Dict:
        """Execute full crisis response cycle"""
        
        # Crisis Detection
        result = await self._crisis_detection_workflow(input_data, result)
        
        # Action Planning
        if result["final_result"].get("crisis_detected"):
            print("\nCrisis detected - initiating action planning")
            action_input = {
                "crisis": result["final_result"],
                "signals": result["steps"][0]["output"]
            }
            action_result = await self._action_planning_workflow(action_input, {"steps": result["steps"]})
            result["steps"] = action_result["steps"]
            result["final_result"]["actions"] = action_result["final_result"]
            
            # Dispatch to Authorities
            print("\nStep 4: Dispatching to Authorities")
            dispatch_agent = self.active_agents["dispatch"]
            dispatch_agent.status = AgentStatus.RUNNING
            dispatch_result = await dispatch_agent.process({
                **action_result["final_result"],
                "crisis_id": f"CRIS-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            })
            dispatch_agent.status = AgentStatus.COMPLETED
            result["steps"].append({"agent": "dispatch", "output": dispatch_result})
            result["final_result"]["dispatch"] = dispatch_result

            # Simulation
            print("\nStep 5: Simulation")
            simulation_agent = self.active_agents["simulation"]
            simulation_agent.status = AgentStatus.RUNNING
            simulation_result = await simulation_agent.process(action_result["final_result"])
            simulation_agent.status = AgentStatus.COMPLETED
            result["steps"].append({"agent": "simulation", "output": simulation_result})
            result["final_result"]["simulation"] = simulation_result
            
            # Visualization
            print("\nStep 6: Visualization")
            viz_agent = self.active_agents["visualization"]
            viz_agent.status = AgentStatus.RUNNING
            viz_result = await viz_agent.process(result["final_result"])
            viz_agent.status = AgentStatus.COMPLETED
            result["steps"].append({"agent": "visualization", "output": viz_result})
            result["final_result"]["visualization"] = viz_result
            
            # Persist crisis and actions to database
            from database.db_setup import SessionLocal, Crisis, Action
            db = SessionLocal()
            try:
                # Save Crisis
                crisis_data = result["final_result"]
                db_crisis = Crisis(
                    crisis_id=f"CRIS-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    crisis_type=crisis_data["crisis_type"],
                    location=crisis_data["location"],
                    severity=crisis_data["severity"],
                    confidence=crisis_data["confidence"],
                    humanitarian_score=crisis_data.get("humanitarian_impact_score"),
                    ethical_reasoning=crisis_data.get("ethical_reasoning"),
                    description=crisis_data["explanation"],
                    latitude=crisis_data["coordinates"].get("lat"),
                    longitude=crisis_data["coordinates"].get("lng"),
                    detected_at=datetime.now()
                )
                db.add(db_crisis)
                
                # Save Actions
                for action in crisis_data.get("actions", []):
                    db_action = Action(
                        action_id=f"ACT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{action}",
                        plan_id=db_crisis.crisis_id,
                        action_type=action,
                        location=crisis_data["location"],
                        priority=crisis_data["severity"],
                        status="pending",
                        created_at=datetime.now()
                    )
                    db.add(db_action)
                
                db.commit()
            except Exception as e:
                print(f"Failed to persist results to database: {e}")
            finally:
                db.close()
            
        return result
        
    def get_agent_traces(self, agent_id: Optional[str] = None) -> List[Dict]:
        """Get agent execution traces"""
        if agent_id:
            traces = [t for t in self.global_trace if t.agent_id == agent_id]
        else:
            traces = self.global_trace
            
        return [asdict(t) for t in traces]
        
    def get_agent_status(self) -> Dict[str, str]:
        """Get status of all agents"""
        return {
            agent_id: agent.status.value 
            for agent_id, agent in self.active_agents.items()
        }
