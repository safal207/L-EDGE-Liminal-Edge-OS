import { startEdgeService } from '../edge/edgeService';
import { startInterfaceServer } from '../interface/apiServer';
import '../core/systemContext';

const edgeServer = startEdgeService();
const interfaceServer = startInterfaceServer();

const shutdown = () => {
  console.log('Shutting down LIMINAL dev cluster...');
  edgeServer.close();
  interfaceServer.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
