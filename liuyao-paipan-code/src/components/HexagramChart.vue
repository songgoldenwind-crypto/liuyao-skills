<template>
  <div class="hexagram-chart" role="img" aria-label="六爻卦象图">
    <div
      v-for="(item, idx) in rows"
      :key="idx"
      class="chart-row"
      :class="{ divider: idx === 3 }"
    >
      <span class="chart-position">{{ item.position }}</span>
      <span class="chart-line" :class="{ yin: !isYang(item.value) }">
        <span class="chart-bar"></span>
        <span v-if="!isYang(item.value)" class="chart-gap"></span>
        <span class="chart-bar"></span>
      </span>
      <span class="chart-marker">{{ showChanging && isChangingVal(item.value) ? (item.value === 9 ? '○' : '×') : ' ' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  yaoValues: {
    type: Array,
    required: true,
    validator: values => values.length === 6 && values.every(value => [6, 7, 8, 9].includes(value))
  },
  showChanging: {
    type: Boolean,
    default: true
  }
})

const POSITION_LABELS = ['初', '二', '三', '四', '五', '上']

const rows = computed(() =>
  [...props.yaoValues]
    .map((value, index) => ({
      value,
      position: POSITION_LABELS[index]
    }))
    .reverse()
)

function isYang(val) { return val === 7 || val === 9 }
function isChangingVal(val) { return val === 6 || val === 9 }
</script>

<style scoped>
.hexagram-chart {
  width: 132px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-row {
  display: grid;
  grid-template-columns: 16px 1fr 16px;
  align-items: center;
  column-gap: 6px;
  min-height: 16px;
}

.chart-row.divider {
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
}

.chart-position {
  font-size: 11px;
  color: #6b6258;
  text-align: center;
}

.chart-line {
  display: inline-flex;
  align-items: center;
  min-width: 88px;
}

.chart-bar {
  display: inline-block;
  width: 38px;
  height: 8px;
  border-radius: 999px;
  background: #1a1a1a;
}

.chart-line:not(.yin) .chart-bar:first-child {
  width: 88px;
}

.chart-line:not(.yin) .chart-bar:last-child {
  display: none;
}

.chart-gap {
  width: 12px;
  flex: 0 0 auto;
}

.chart-marker {
  font-size: 12px;
  line-height: 1;
  color: #c03c3c;
  text-align: center;
  min-height: 12px;
}
</style>
