import { Calendar } from 'lucide-react';
import AdminBookingsWorkspace from '../AdminBookingsWorkspace.jsx';

// Survey bookings = the shared workspace with the survey config.
export default function AdminSurveyBookings() {
    return (
        <AdminBookingsWorkspace
            config={{
                endpoint: '/divisions/survey/bookings',
                Icon: Calendar,
                accent: {
                    softBg: 'bg-amber-500/10',
                    softText: 'text-amber-500',
                    chipBg: 'bg-amber-100 dark:bg-amber-950/50',
                    chipText: 'text-amber-800 dark:text-amber-300',
                    ring: 'focus:ring-amber-500',
                    activeButton: 'bg-amber-500 text-white shadow-sm',
                    solidButton: 'bg-amber-500 hover:bg-amber-600 text-white',
                    text: 'text-amber-600 dark:text-amber-400',
                    pillPending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                },
                labels: {
                    title: 'Land Survey Bookings',
                    subtitle: 'Manage field-survey and boundary verification requests.',
                    divisionTag: 'SURVEY DIVISION',
                    searchPlaceholder: 'Search survey requests...',
                    loadError: 'Failed to load survey bookings',
                    networkError: 'Network error loading survey bookings',
                    statusSuccess: (s) => `Status updated to ${s}`,
                    statusError: 'Error updating booking status',
                    emptyTitle: 'No Survey Bookings Found',
                    emptyBody: 'Inquiries submitted via the Survey portal will appear here.',
                    serviceCol: 'Survey Service',
                    locationCol: 'Location',
                    dateCol: 'Preferred Date',
                    serviceDefault: 'Cadastral / Boundary',
                    locationDefault: 'Lagos State',
                    modalTitle: 'Survey Booking Details',
                    serviceLabel: 'Service',
                    locationLabel: 'Site Location',
                    locationFallback: 'Location details provided upon consultation',
                    notesLabel: 'Project Requirements / Notes',
                    statusLabel: 'Update Operational Status',
                    mailSubject: 'Regarding Your Survey Request with Buildwith_lami',
                },
            }}
        />
    );
}
