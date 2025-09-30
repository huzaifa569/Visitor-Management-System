'use client'

import { useEffect, useState } from 'react'
import { newVisitorAPI, VisitorForm } from '@/lib/api';


export default function VisitorsPage() {
  const [visitorHistory, setVisitorHistory] = useState<VisitorForm[]>([])
  const [contractorHistory, setContractorHistory] = useState<VisitorForm[]>([])
  const [loading, setLoading] = useState(true)

  

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data: VisitorForm[] = await newVisitorAPI.getAll()
        const visitor = data.filter(v => v.visitorCategory === "visitor")
        const contractor = data.filter(v => v.visitorCategory === "contractor")
        setVisitorHistory(visitor)
        setContractorHistory(contractor)
      } catch (err) {
        console.error('Failed to fetch visit history:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Visit History</h1>

      {loading ? (
        <p>Loading history...</p>
      ) : visitorHistory.length === 0 && contractorHistory.length === 0 ? (
        <p>No visit history found.</p>
      ) : (
        <div className="flex flex-col gap-4 md:gap-8">

          {/* Visitors Table */}
          <h2 className="font-semibold text-gray-800 mt-4 md:mt-6 md:text-xl">Visitors History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm shadow rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Form Type</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Check-In</th>
                  <th className="px-4 py-2 text-left">Check-Out</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitorHistory.map((entry) => (
                  <tr key={entry._id} className="border-t">
                    <td className="px-4 py-2 capitalize">{entry.visitorCategory}</td>
                    <td className="px-4 py-2">{entry.siteLocation}</td>
                    <td className="px-4 py-2">{new Date(entry.createdAt || "").toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 capitalize">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contractors Table */}
          <h2 className="font-semibold text-gray-800 mt-4 md:mt-6 md:text-xl">Contractors History</h2>
          <div className="overflow-x-auto">
            <table
              className="min-w-full border shadow text-sm rounded divide-y divide-gray-200"
              aria-label="contractorsForm list"
            >
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Form Type</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Hazards</th>
                  <th className="px-4 py-2 text-left">PPE</th>
                  <th className="px-4 py-2 text-left">Check-In</th>
                  <th className="px-4 py-2 text-left">Check-Out</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {contractorHistory.map((entry) => (
                  <tr key={entry._id} className="border-t">
                    <td className="px-4 py-2 capitalize">{entry.visitorCategory}</td>
                    <td className="px-4 py-2">{entry.siteLocation}</td>

                    {/* Hazards */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Array.isArray(entry.hazards) && entry.hazards.length > 0 ? (
                        <ul className="list-disc ml-4 space-y-1">
                          {entry.hazards.map((hazard, index) => (
                            <li key={index}>
                              <div><span className="font-semibold">Title:</span> {hazard.title}</div>
                              <div><span className="font-semibold">Risk:</span> {hazard.risk}</div>
                              <div><span className="font-semibold">Controls:</span> {hazard.selectedControls?.join(', ')}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No hazards</span>
                      )}
                    </td>

                    {/* PPE */}
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500">
                      {entry.ppe && Object.values(entry.ppe).includes('Y') ? (
                        <ul className="list-disc ml-4 space-y-1">
                          {Object.entries(entry.ppe).map(([item, value]) =>
                            value === 'Y' ? <li key={item}>{item}</li> : null
                          )}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No PPE</span>
                      )}
                    </td>

                    <td className="px-4 py-2">{new Date(entry.createdAt || "").toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 capitalize">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
