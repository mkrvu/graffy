import { useClanStore } from "@/stores/clanStore"
import { useProfileStore } from "@/stores/profileStore"
import { useTaskStore } from "@/stores/taskStore"
import { useHabitStore } from "@/stores/habitStore"
import { useSphereStore } from "@/stores/sphereStore"
import { useSectionStore } from "@/stores/sectionStore"
import { useAdminStore } from "@/stores/adminStore"
import { useNotificationStore } from "@/stores/notificationStore"

export function resetUserStores() {
  useClanStore.setState({ myClan: null, isInitialized: false, isLoading: false, error: null })
  useProfileStore.setState({
    stats: null,
    statsResponse: null,
    graphStats: null,
    badges: [],
    history: [],
    isLoading: false,
    error: null,
  })
  useTaskStore.setState({ tasks: [], isLoading: false, hasMore: true, error: null })
  useHabitStore.setState({ habits: [], isLoading: false, error: null })
  useSphereStore.setState({ spheres: [], isLoading: false, error: null })
  useSectionStore.setState({ sections: [], isFetching: false })
  useAdminStore.setState({ users: [], badges: [], stats: null, isLoading: false, error: null })
  useNotificationStore.setState({ toasts: [] })
}
