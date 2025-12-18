import Layout from '@/components/Layout';

export default function Docs() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-indigo mx-auto lg:max-w-none">
                    <h1>Documentation</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        <div className="col-span-1 border-r border-gray-200 pr-4">
                            <h3 className="font-bold text-gray-900">Getting Started</h3>
                            <ul className="list-none pl-0 space-y-2 mt-2">
                                <li><a href="#quickstart" className="text-indigo-600 hover:underline">Quickstart Guide</a></li>
                                <li><a href="#monitoring" className="text-gray-600 hover:text-indigo-600">Setting up Monitors</a></li>
                                <li><a href="#incidents" className="text-gray-600 hover:text-indigo-600">Managing Incidents</a></li>
                                <li><a href="#ownership" className="text-gray-600 hover:text-indigo-600">Service Ownership</a></li>
                                <li><a href="#deployments" className="text-gray-600 hover:text-indigo-600">Deployment Tracking</a></li>
                                <li><a href="#slos" className="text-gray-600 hover:text-indigo-600">SLOs & Error Budgets</a></li>
                                <li><a href="#workflows" className="text-gray-600 hover:text-indigo-600">Intelligent Workflows</a></li>
                                <li><a href="#ai-remediation" className="text-gray-600 hover:text-indigo-600">AI Auto-Remediation</a></li>
                            </ul>

                            <h3 className="font-bold text-gray-900 mt-6">API Reference</h3>
                            <ul className="list-none pl-0 space-y-2 mt-2">
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Authentication</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Services Endpoint</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-indigo-600">Webhooks</a></li>
                            </ul>
                        </div>

                        <div className="col-span-2">
                            <h2 id="quickstart" className="text-2xl font-bold text-gray-900 mb-4">Quickstart Guide</h2>
                            <p className="text-gray-500 mb-4">
                                Welcome to FlowOps! This guide will help you set up your first monitor in under 2 minutes.
                            </p>

                            <h3 id="monitoring" className="text-xl font-bold text-gray-900 mt-8 mb-2">1. Add a Service</h3>
                            <p className="text-gray-500 mb-4">
                                Navigate to the <strong>Monitoring</strong> tab and click "Add Service". Enter a friendly name for your service (e.g., "Payments API").
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-2">2. Configure Endpoint</h3>
                            <p className="text-gray-500 mb-4">
                                Once the service is created, add an endpoint:
                            </p>
                            <div className="bg-gray-800 text-white p-4 rounded-md font-mono text-sm mb-4">
                                URL: https://api.yourservice.com/health<br />
                                Method: GET<br />
                                Interval: 60s
                            </div>

                            <h3 id="incidents" className="text-xl font-bold text-gray-900 mt-8 mb-2">3. Receive Alerts</h3>
                            <p className="text-gray-500 mb-8">
                                FlowOps will automatically ping your endpoint. If it returns a non-200 status code, an <strong>Incident</strong> will be created, and you will be notified via the Dashboard.
                            </p>

                            <hr className="border-gray-200 my-8" />

                            <h2 id="ownership" className="text-2xl font-bold text-gray-900 mb-4">Service Ownership</h2>
                            <p className="text-gray-500 mb-4">
                                Organize your engineering organization by creating <strong>Teams</strong> and assigning services to them.
                            </p>
                            <ul className="list-disc pl-5 text-gray-500 space-y-2 mb-4">
                                <li>Go to <strong>Teams</strong> in the sidebar.</li>
                                <li>Create a Team (e.g., "Platform Reliability").</li>
                                <li>When creating or editing a Service, assign it to a Team.</li>
                                <li>Incidents will now be auto-assigned to that Team.</li>
                            </ul>

                            <h2 id="deployments" className="text-2xl font-bold text-gray-900 mb-4 mt-8">Deployment Tracking</h2>
                            <p className="text-gray-500 mb-4">
                                Integrate your CI/CD pipeline to track deployments. Send a POST request to record a new version:
                            </p>
                            <div className="bg-gray-800 text-white p-4 rounded-md font-mono text-xs mb-4 overflow-x-auto">
                                curl -X POST https://api.flowops.com/api/v1/deployments \<br />
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                                &nbsp;&nbsp;-d '{"{"}"service_id": 1, "version": "v1.2.0", "git_commit": "sha123", "status": "success"{"}"}'
                            </div>

                            <h2 id="slos" className="text-2xl font-bold text-gray-900 mb-4 mt-8">Reliability & SLOs</h2>
                            <p className="text-gray-500 mb-4">
                                Move beyond "uptime" and track <strong>Service Level Objectives</strong>.
                            </p>
                            <ul className="list-disc pl-5 text-gray-500 space-y-2">
                                <li>Define an SLO target (e.g., 99.9%).</li>
                                <li>FlowOps calculates your <strong>Error Budget</strong> based on a 30-day window.</li>
                                <li>Monitor the budget gauge to decide if you should freeze deploys or ship features.</li>
                            </ul>

                            <hr className="border-gray-200 my-8" />

                            <h2 id="workflows" className="text-2xl font-bold text-gray-900 mb-4 mt-8">Intelligent Workflows</h2>
                            <p className="text-gray-500 mb-4">
                                Automate your runbooks using our drag-and-drop Workflow Engine.
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">Builder Features</h3>
                            <ul className="list-disc pl-5 text-gray-500 space-y-2 mb-4">
                                <li><strong>Triggers</strong>: Manual or API-based execution.</li>
                                <li><strong>Conditions</strong>: Branching logic (True/False paths) for complex decision making.</li>
                                <li><strong>Actions</strong>: Send Slack notifications, make HTTP requests, or execute scripts.</li>
                            </ul>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Note:</strong> Workflows run asynchronously via Celery workers for scalability.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h2 id="ai-remediation" className="text-2xl font-bold text-gray-900 mb-4 mt-8">AI Auto-Remediation</h2>
                            <p className="text-gray-500 mb-4">
                                FlowOps uses AI to connect <strong>Incidents</strong> with <strong>Workflows</strong>.
                            </p>
                            <div className="grid grid-cols-1 bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-2">How it works:</h4>
                                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                                    <li>An incident occurs (e.g., "Database Timeout").</li>
                                    <li>Navigate to the Incident detail page and click <strong>"Analyze Root Cause"</strong>.</li>
                                    <li>The AI analyzes the error and scans your active workflows.</li>
                                    <li>If a matching workflow is found (e.g., "Restart Database"), a <strong>"Fix it Now"</strong> button appears.</li>
                                    <li>Clicking the button executes the remediation workflow instantly.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
