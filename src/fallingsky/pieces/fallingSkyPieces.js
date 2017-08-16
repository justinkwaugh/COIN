import FactionPieceFactory from '../../common/factionPieceFactory';
import AlliedTribe from './alliedTribe';
import Auxilia from './auxilia';
import Citadel from './citadel';
import Fort from './fort';
import Leader from './leader';
import Legion from './legion';
import Warband from './warband';

class FallingSkyPieces {
  constructor() {
  }

  static registerWithFactory() {
    FactionPieceFactory.register((new AlliedTribe({})).type, AlliedTribe);
    FactionPieceFactory.register((new Auxilia({})).type, Auxilia);
    FactionPieceFactory.register((new Citadel({})).type, Citadel);
    FactionPieceFactory.register((new Fort({})).type, Fort);
    FactionPieceFactory.register((new Leader({})).type, Leader);
    FactionPieceFactory.register((new Legion({})).type, Legion);
    FactionPieceFactory.register((new Warband({})).type, Warband);
  }
}

export default FallingSkyPieces;