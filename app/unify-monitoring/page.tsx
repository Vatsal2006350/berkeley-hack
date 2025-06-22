'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, BarChart3, CheckCircle, Clock, Database, Download, FileText, Server } from 'lucide-react'

interface ApiCall {
  id: string
  timestamp: string
  endpoint: string
  method: string
  status: number
  patient_name: string
  processing_time_ms: number
  request_id: string
}

export default function UnifyMonitoringPage() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    averageProcessingTime: 0,
    totalPdfsGenerated: 0
  })

  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    // Load initial data
    loadApiCallHistory()
    
    // Set up live monitoring if enabled
    let interval: NodeJS.Timeout
    if (isLive) {
      interval = setInterval(loadApiCallHistory, 2000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive])

  const loadApiCallHistory = async () => {
    try {
      // In a real implementation, this would fetch from a logging service
      // For demo purposes, we'll simulate with localStorage
      const storedCalls = localStorage.getItem('unify-api-calls')
      if (storedCalls) {
        const calls = JSON.parse(storedCalls)
        setApiCalls(calls.slice(-10)) // Show last 10 calls
        
        // Calculate stats
        const successful = calls.filter((call: ApiCall) => call.status === 200).length
        const avgTime = calls.reduce((acc: number, call: ApiCall) => acc + call.processing_time_ms, 0) / calls.length
        
        setStats({
          totalCalls: calls.length,
          successfulCalls: successful,
          averageProcessingTime: Math.round(avgTime),
          totalPdfsGenerated: successful
        })
      }
    } catch (error) {
      console.error('Error loading API call history:', error)
    }
  }

  const testUnifyApi = async () => {
    try {
      const testCall = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: '/api/unify-pdf-summary',
        method: 'POST',
        status: 200,
        patient_name: 'Test Patient',
        processing_time_ms: Math.floor(Math.random() * 1000) + 500,
        request_id: `unify-test-${Date.now()}`
      }

      // Add to localStorage for demo
      const storedCalls = localStorage.getItem('unify-api-calls')
      const calls = storedCalls ? JSON.parse(storedCalls) : []
      calls.push(testCall)
      localStorage.setItem('unify-api-calls', JSON.stringify(calls))
      
      // Reload data
      loadApiCallHistory()
    } catch (error) {
      console.error('Error testing API:', error)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem('unify-api-calls')
    setApiCalls([])
    setStats({
      totalCalls: 0,
      successfulCalls: 0,
      averageProcessingTime: 0,
      totalPdfsGenerated: 0
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a1e] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Unify API Monitoring Dashboard</h1>
            <p className="text-white/60 mt-2">Real-time tracking of Unify GTM PDF Summary Agent usage</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? "default" : "outline"}
              className={isLive ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Activity className="w-4 h-4 mr-2" />
              {isLive ? "Live Monitoring ON" : "Enable Live Monitoring"}
            </Button>
            <Button onClick={testUnifyApi} variant="outline">
              <Server className="w-4 h-4 mr-2" />
              Test API Call
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#1a1a30] border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total API Calls</CardTitle>
              <BarChart3 className="h-4 w-4 text-[#4a6bff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCalls}</div>
              <p className="text-xs text-white/60">Unify platform requests</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalCalls > 0 ? Math.round((stats.successfulCalls / stats.totalCalls) * 100) : 0}%
              </div>
              <p className="text-xs text-white/60">{stats.successfulCalls} successful calls</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageProcessingTime}ms</div>
              <p className="text-xs text-white/60">Response time</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a30] border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">PDFs Generated</CardTitle>
              <Download className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPdfsGenerated}</div>
              <p className="text-xs text-white/60">Clinical summaries created</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Information */}
        <Card className="bg-[#1a1a30] border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="w-5 h-5 mr-2 text-[#4a6bff]" />
              Unify GTM Platform Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">API Endpoint</h4>
                <code className="text-xs bg-black/50 p-2 rounded text-green-400 block">
                  POST /api/unify-pdf-summary
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Platform Version</h4>
                <Badge variant="outline" className="bg-[#4a6bff]/20 text-[#4a6bff] border-[#4a6bff]/50">
                  Unify GTM v1.0.0
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/90">Content Processing</h4>
                <div className="text-xs text-white/60">
                  ✓ Patient-friendly language formatting<br/>
                  ✓ Multi-modal data integration<br/>
                  ✓ Clinical summary generation
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent API Calls */}
        <Card className="bg-[#1a1a30] border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#4a6bff]" />
              Recent Unify API Calls
            </CardTitle>
            <Button onClick={clearHistory} variant="outline" size="sm">
              Clear History
            </Button>
          </CardHeader>
          <CardContent>
            {apiCalls.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Server className="w-12 h-12 mx-auto mb-4 text-white/30" />
                <p>No API calls recorded yet</p>
                <p className="text-sm">Click "Test API Call" to generate sample data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant={call.status === 200 ? "default" : "destructive"}
                        className={call.status === 200 ? "bg-green-600" : ""}
                      >
                        {call.status}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium text-white">{call.patient_name}</div>
                        <div className="text-xs text-white/60">
                          {call.method} {call.endpoint}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{call.processing_time_ms}ms</div>
                      <div className="text-xs text-white/60">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Details */}
        <Card className="bg-[#1a1a30] border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Unify Platform Features in Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/90">Data Processing</h4>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>✓ Patient record validation</li>
                  <li>✓ Multi-modal content integration</li>
                  <li>✓ Clinical terminology simplification</li>
                  <li>✓ Structured data formatting</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/90">Output Generation</h4>
                <ul className="text-sm text-white/60 space-y-1">
                  <li>✓ Patient-friendly summaries</li>
                  <li>✓ Professional PDF formatting</li>
                  <li>✓ Section-based organization</li>
                  <li>✓ Real-time processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 