/**
 * PlantCareTab.jsx
 * Va en: src/components/admin/care/PlantCareTab.jsx
 *
 * Uso en CarePage.jsx:
 *   import PlantCareTab from './care/PlantCareTab'
 *   <PlantCareTab plantId={plant.id} plantName={plant.name} />
 */
import { useState } from 'react'
import {
  usePlantCareSchedules,
  useCareLogs,
  useCareProcesses,
  useAddSchedule,
  useUpdateSchedule,
  useRemoveSchedule,
  useLogCare,
  useDeleteCareLog,
} from '../../../hooks/useCare'
import { getCareStatus } from '../../../services/care.service'
import { CareScheduleManager } from './CareScheduleManager'
import { LogCareModal }        from './LogCareModal'
import { CareHistory }         from './CareHistory'

const TABS = [
  { key: 'schedules', label: 'Procesos' },
  { key: 'history',   label: 'Historial' },
]

export default function PlantCareTab({ plantId, plantName }) {
  const [activeTab, setActiveTab] = useState('schedules')
  const [logTarget, setLogTarget] = useState(null)

  const { data: schedules = [], isLoading: loadingSchedules } = usePlantCareSchedules(plantId)
  const { data: history   = [], isLoading: loadingHistory   } = useCareLogs(plantId)
  const { data: processes = []                               } = useCareProcesses()

  const addSchedule    = useAddSchedule()
  const updateSchedule = useUpdateSchedule()
  const removeSchedule = useRemoveSchedule()
  const logCare        = useLogCare()
  const deleteLog      = useDeleteCareLog()

  const schedulesWithStatus = schedules.map((s) => ({
    ...s,
    status: getCareStatus(s.next_due_at),
  }))

  const assignedIds        = schedules.map((s) => s.care_processes?.id)
  const availableProcesses = processes.filter((p) => !assignedIds.includes(p.id))
  const urgentCount        = schedulesWithStatus.filter(
    (s) => s.status === 'vencido' || s.status === 'hoy'
  ).length

  if (loadingSchedules || loadingHistory) {
    return <p className="text-muted">Cargando cuidados...</p>
  }

  return (
    <div>

      {/* Alerta urgencia */}
      {urgentCount > 0 && (
        <div className="care-alert">
          {urgentCount} cuidado{urgentCount > 1 ? 's' : ''} requiere{urgentCount > 1 ? 'n' : ''} atencion hoy.
        </div>
      )}

      {/* Tabs */}
      <div className="care-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={'care-tab' + (activeTab === key ? ' care-tab--active' : '')}
            onClick={() => setActiveTab(key)}
          >
            {label} ({key === 'schedules' ? schedules.length : history.length})
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'schedules' ? (
        <CareScheduleManager
          schedules={schedulesWithStatus}
          availableProcesses={availableProcesses}
                    onAdd={({ processId, frequencyDays, notifyEnabled }) =>
            addSchedule.mutateAsync({
              plant_id: plantId,
              process_id: processId,
              frequency_days: frequencyDays,
              notify_enabled: notifyEnabled,
            })
          }
          onUpdate={(id, { frequencyDays, notifyEnabled }) =>
  updateSchedule.mutateAsync({
    id,
    plant_id: plantId,
    frequency_days: frequencyDays,
    notify_enabled: notifyEnabled,
  })
}
          onRemove={(id)      => removeSchedule.mutateAsync({ id, plant_id: plantId })}
          onLog={(schedule)   => setLogTarget(schedule)}
        />
      ) : (
        <CareHistory
          history={history}
          onDelete={(id) => deleteLog.mutateAsync({ id, plant_id: plantId })}
        />
      )}

      {/* Modal de registro */}
      {logTarget && (
        <LogCareModal
          schedule={logTarget}
          onConfirm={async (data) => {
            await logCare.mutateAsync({ ...data, plant_id: plantId })
            setLogTarget(null)
            setActiveTab('history')
          }}
          onClose={() => setLogTarget(null)}
        />
      )}
    </div>
  )
}
