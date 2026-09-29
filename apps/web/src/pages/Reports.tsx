import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import { ReportStatus } from '../types';

interface Report {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
  };
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
}

interface PaginatedResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

const statusLabels = {
  [ReportStatus.PENDING]: 'Pending',
  [ReportStatus.REVIEWED]: 'Reviewed',
  [ReportStatus.RESOLVED]: 'Resolved',
  [ReportStatus.DISMISSED]: 'Dismissed',
};

const statusColors = {
  [ReportStatus.PENDING]: 'badge-pending',
  [ReportStatus.REVIEWED]: 'badge-available',
  [ReportStatus.RESOLVED]: 'badge-unavailable',
  [ReportStatus.DISMISSED]: 'badge-unavailable',
};

export default function Reports() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionStatus, setActionStatus] = useState<ReportStatus>(ReportStatus.RESOLVED);

  const { data, isLoading } = useQuery(['reports'], () =>
    api.get('/admin/reports').then((res) => res.data.data as PaginatedResponse),
  );

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: ReportStatus }) =>
      api.patch(`/reports/${id}/status`, { status }).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        setSelectedReport(null);
      },
    },
  );

  const handleAction = (status: ReportStatus) => {
    if (selectedReport) {
      updateStatusMutation.mutate({ id: selectedReport.id, status });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-900">Reports</h2>
        <p className="text-sm text-primary-700 mt-1">Review reported property listings</p>
      </div>

      {isLoading ? (
        <p className="text-center py-10">Loading reports...</p>
      ) : data?.data.length === 0 ? (
        <p className="text-center py-10 text-primary-500">No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-sm border border-primary-100 overflow-hidden">
            <thead className="bg-primary-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-primary-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {data?.data.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary-900">{report.property.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-primary-900">
                      {report.user.firstName} {report.user.lastName}
                    </p>
                    <p className="text-sm text-primary-500">{report.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-primary-700">{report.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-primary-900 mb-4">Report Review</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-700">Property</label>
                <p className="text-primary-900">{selectedReport.property.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-primary-700">Reported by</label>
                <p className="text-primary-900">
                  {selectedReport.user.firstName} {selectedReport.user.lastName} ({selectedReport.user.email})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-primary-700">Reason</label>
                <p className="text-primary-900">{selectedReport.reason}</p>
              </div>
              {selectedReport.description && (
                <div>
                  <label className="text-sm font-medium text-primary-700">Details</label>
                  <p className="text-primary-900">{selectedReport.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as ReportStatus)}
                  className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value={ReportStatus.RESOLVED}>Resolve - Make Unavailable</option>
                  <option value={ReportStatus.DISMISSED}>Dismiss</option>
                  <option value={ReportStatus.REVIEWED}>Mark as Reviewed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionStatus)}
                className="btn-primary"
                disabled={updateStatusMutation.isLoading}
              >
                {updateStatusMutation.isLoading ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
