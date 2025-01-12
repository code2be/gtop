var blessed = require('blessed'),
  contrib = require('blessed-contrib'),
  monitor = require('./monitor');

const { argv } = require('yargs');

var netInterface = null;

if(typeof argv.net != 'undefined') {
  netInterface = argv.net;
}

var screen = blessed.screen()
var grid = new contrib.grid({
  rows: 12,
  cols: 12,
  screen: screen
})

var cpuLine = grid.set(0, 0, 4, 12, contrib.line, {
  showNthLabel: 5,
  maxY: 100,
  label: 'CPU History',
  showLegend: true,
})

var hostnameWidget = grid.set(0, 8, 1, 2, contrib.markdown, {
  label: "HOSTNAME",
  fg: "green",
  selectedFg: "green"
})

var memLine = grid.set(4, 0, 4, 8, contrib.line, {
  showNthLabel: 5,
  maxY: 100,
  label: 'Memory and Swap History',
  showLegend: true,
  legend: {
    width: 10
  }
})

var memDonut = grid.set(4, 8, 2, 4, contrib.donut, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Memory',
});

var swapDonut = grid.set(6, 8, 2, 4, contrib.donut, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Swap',
});

var netSpark = grid.set(8, 0, 2, 6, contrib.sparkline, {
  label: 'Network History',
  tags: true,
  style: {
    fg: 'blue'
  }
})

var diskDonut = grid.set(10, 0, 2, 6, contrib.donut, {
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  remainColor: 'black',
  label: 'Disk usage',
})

var procTable = grid.set(8, 6, 4, 6, contrib.table, {
  keys: true,
  label: 'Processes',
  columnSpacing: 1,
  columnWidth: [7, 24, 7, 7]
})

procTable.focus()

screen.render();
screen.on('resize', function (a) {
  cpuLine.emit('attach');
  memLine.emit('attach');
  memDonut.emit('attach');
  swapDonut.emit('attach');
  netSpark.emit('attach');
  diskDonut.emit('attach');
  procTable.emit('attach');
});

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

function init() {
  new monitor.Cpu(cpuLine); //no Windows support
  new monitor.Mem(memLine, memDonut, swapDonut);
  new monitor.Net(netSpark, netInterface);
  new monitor.Disk(diskDonut);
  new monitor.Proc(procTable, blessed, screen); // no Windows support
  new monitor.Host(hostnameWidget);
}


process.on('uncaughtException', function (err) {
  // avoid exiting due to unsupported system resources in Windows
});

module.exports = {
  init: init,
  monitor: monitor
};