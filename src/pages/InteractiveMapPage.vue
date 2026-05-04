<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { InputText } from "primevue";
import { useRepairRequestStore } from "@/stores/useRepairRequestStore";
import { storeToRefs } from "pinia";
import { ELEVATOR_MONITOR_API_BASE_URL } from "@/config/elevatorMonitor";

type MonitorRequest = {
  request_id: string;
  address: string;
  status: string;
};

const requestStore = useRepairRequestStore();
const { requestList } = storeToRefs(requestStore);

const iframeRef = ref<HTMLIFrameElement | null>(null);
const mapReady = ref(false);
const searchQuery = ref("");
const monitorRequests = ref<MonitorRequest[]>([]);

const mapSource = computed(() => {
  return `/elevator-map.html?apiUrl=${encodeURIComponent(ELEVATOR_MONITOR_API_BASE_URL)}`;
});

const requestsWithCoordinates = computed(() => {
  return requestList.value.filter(
    (request) =>
      Boolean(request.objectAddress?.trim()) &&
      typeof request.latitude === "number" &&
      typeof request.longitude === "number",
  );
});

const filteredRequests = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return requestsWithCoordinates.value;
  }

  return requestsWithCoordinates.value.filter((request) => {
    return (
      request.objectAddress.toLowerCase().includes(query) ||
      request.author.toLowerCase().includes(query) ||
      String(request.id).includes(query)
    );
  });
});

const syncedByAddress = computed(() => {
  const monitorAddressSet = new Set(
    monitorRequests.value.map((request) => request.address.toLowerCase().trim()),
  );

  return requestsWithCoordinates.value.filter((request) =>
    monitorAddressSet.has(request.objectAddress.toLowerCase().trim()),
  ).length;
});

const syncRequestsToMap = () => {
  if (!mapReady.value || !iframeRef.value?.contentWindow) {
    return;
  }

  const payload = requestsWithCoordinates.value.map((request) => ({
    id: request.id,
    address: request.objectAddress,
    latitude: request.latitude,
    longitude: request.longitude,
    description: request.comment || "Заявка на ремонт лифта",
  }));

  iframeRef.value.contentWindow.postMessage(
    {
      type: "SYNC_REQUESTS",
      data: payload,
    },
    window.location.origin,
  );
};

const focusRequestOnMap = (requestId: number) => {
  const request = requestsWithCoordinates.value.find((item) => item.id === requestId);
  if (!request || !iframeRef.value?.contentWindow) {
    return;
  }

  iframeRef.value.contentWindow.postMessage(
    {
      type: "FOCUS_REQUEST",
      data: {
        id: request.id,
        address: request.objectAddress,
        latitude: request.latitude,
        longitude: request.longitude,
        description: request.comment || "Заявка на ремонт лифта",
      },
    },
    window.location.origin,
  );
};

const loadMonitorRequests = async () => {
  try {
    const response = await fetch(`${ELEVATOR_MONITOR_API_BASE_URL}/requests`);
    const data = await response.json();
    monitorRequests.value = Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.log("Не удалось получить заявки из elevator_monitor", error);
    monitorRequests.value = [];
  }
};

const handleMapMessage = (event: MessageEvent) => {
  if (event.origin !== window.location.origin) {
    return;
  }

  if (event.data?.type === "MAP_READY") {
    mapReady.value = true;
    syncRequestsToMap();
  }
};

watch(
  requestsWithCoordinates,
  () => {
    syncRequestsToMap();
  },
  { deep: true },
);

onMounted(async () => {
  window.addEventListener("message", handleMapMessage);
  await requestStore.getRepairRequests();
  await loadMonitorRequests();
  syncRequestsToMap();
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleMapMessage);
});
</script>

<template>
  <div class="map-page">
    <section class="search-panel">
      <h3 class="panel-title">Поиск заявок</h3>
      <p class="panel-subtitle">
        Карта показывает только реальные заявки из системы с координатами.
      </p>

      <InputText
        v-model="searchQuery"
        placeholder="Поиск по адресу, автору или ID"
        class="w-full"
      />

      <div class="sync-stats">
        <div>Заявок с координатами: <strong>{{ requestsWithCoordinates.length }}</strong></div>
        <div>Синхронизировано с monitor API: <strong>{{ syncedByAddress }}</strong></div>
      </div>

      <div class="request-list">
        <button
          v-for="request in filteredRequests"
          :key="request.id"
          type="button"
          class="request-item"
          @click="focusRequestOnMap(request.id)"
        >
          <div class="item-id">Заявка #{{ request.id }}</div>
          <div class="item-address">{{ request.objectAddress }}</div>
          <div class="item-meta">{{ request.city || "Город не указан" }} - {{ request.author }}</div>
        </button>

        <div v-if="filteredRequests.length === 0" class="empty-list">
          По вашему запросу ничего не найдено.
        </div>
      </div>
    </section>

    <section class="map-panel">
      <iframe
        ref="iframeRef"
        :src="mapSource"
        title="Интерактивная карта"
        class="map-iframe"
      />
    </section>
  </div>
</template>

<style scoped>
.map-page {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  min-height: calc(100vh - 180px);
}

.search-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.panel-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
}

.sync-stats {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  font-size: 0.84rem;
  color: #334155;
  display: grid;
  gap: 6px;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 360px);
  overflow-y: auto;
}

.request-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  text-align: left;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.request-item:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.item-id {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.85rem;
}

.item-address {
  color: #1e293b;
  font-size: 0.9rem;
  margin-top: 4px;
}

.item-meta {
  color: #64748b;
  font-size: 0.78rem;
  margin-top: 6px;
}

.empty-list {
  text-align: center;
  color: #94a3b8;
  padding: 24px 10px;
}

.map-panel {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.map-iframe {
  width: 100%;
  min-height: calc(100vh - 180px);
  border: 0;
}

@media (max-width: 1100px) {
  .map-page {
    grid-template-columns: 1fr;
  }

  .request-list {
    max-height: 300px;
  }

  .map-iframe {
    min-height: 520px;
  }
}
</style>
