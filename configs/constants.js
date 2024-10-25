export const ROUTE_COLORS = ['black', 'white', 'blue', 'red', 'gray', 'green', 'yellow', 'purple', 'orange', 'pink']

// NOTE: Ordered from highest to lowest status
const ASCENT_TICK_TYPES = [
  { name: 'flash',
    send: true,
  },
  { name: 'redpoint',
    send: true,
  },
  { name: 'attempt',
    send: false,
  },
]
export const ALL_ASCENT_TICK_TYPES = ASCENT_TICK_TYPES.map(tick => tick.name)
export const SENT_ASCENT_TICK_TYPES = ASCENT_TICK_TYPES.filter(tick => tick.send).map(tick => tick.name)

export const STEEPNESS_OPTIONS = ['slab', 'vertical', 'overhung', 'roof']