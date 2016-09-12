import cluster from 'cluster';
import os from 'os';

const workers = {};
const count = os.cpus().length;

function spawn(i) {
  const worker = cluster.fork();
  workers[worker.pid] = worker;

  if (i === 1) {
    process._debugPort = 5858 + worker.id;  // eslint-disable-line no-underscore-dangle
  }

  return worker;
}

export default function clusterer(serve) {
  if (cluster.isMaster) {
    for (let i = 0; i < count; i += 1) {
      spawn(i);
    }

    cluster.on('exit', (worker) => {
      delete workers[worker.pid];
      spawn(0);
    });
  } else {
    serve(cluster);
  }
}
