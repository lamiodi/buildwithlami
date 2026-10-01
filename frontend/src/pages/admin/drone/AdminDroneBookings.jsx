import { Plane } from 'lucide-react';
import AdminBookingsWorkspace from '../AdminBookingsWorkspace.jsx';

// Drone bookings = the shared workspace with the drone config.
export default function AdminDroneBookings() {
    return (
        <AdminBookingsWorkspace
            config={{
                endpoint: '/divisions/drone/bookings',
                Icon: Plane,
                accent: {
                    softBg: 'bg-indigo-500/10',
                    softText: 'text-indigo-500',
                    chipBg: 'bg-indigo-100 dark:bg-indigo-950/50',
                    chipText: 'text-indigo-800 dark:text-indigo-300',
                    ring: 'focus:ring-indigo-500',
                    activeButton: 'bg-indigo-600 text-white shadow-sm',
                    solidButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                    text: 'text-indigo-600 dark:text-indigo-400',
                    pillPending: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
                },
                labels: {
                    title: 'Drone Flight Bookings',
                    subtitle: 'Manage aerial-imagery, LiDAR mapping, and inspection flight requests.',
                    divisionTag: 'DRONE DIVISION',
                    searchPlaceholder: 'Search flight requests...',
                    loadError: 'Failed to load drone bookings',
                    networkError: 'Network error loading drone bookings',
                    statusSuccess: (s) => `Flight mission status updated to ${s}`,
                    statusError: 'Error updating flight booking status',
                    emptyTitle: 'No Drone Bookings Found',
                    emptyBody: 'Flight mission requests submitted via the Drone portal will appear here.',
                    serviceCol: 'Flight Service',
                    locationCol: 'Flight Location',
                    dateCol: 'Requested Date',
                    serviceDefault: 'Aerial Survey & Orthomosaic',
                    locationDefault: 'Nigeria',
                    modalTitle: 'Drone Flight Details',
                    serviceLabel: 'Mission Service',
                    locationLabel: 'Target Flight Area / Coordinates',
                    locationFallback: 'Location details provided upon mission briefing',
                    notesLabel: 'Flight Specifications / Output Format',
                    statusLabel: 'Update Flight Mission Status',
                    mailSubject: 'Regarding Your Drone Mission Request with Buildwith_lami',
                },
            }}
        />
    );
}
