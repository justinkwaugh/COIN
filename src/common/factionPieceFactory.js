import FactionPiece from './factionPiece';

class FactionPieceFactory {
  constructor() {
  }

  static register(piecetype, piececlass) {
    if ((!FactionPieceFactory._registeredTypes.has(piecetype))) {
      FactionPieceFactory._registeredTypes.set(piecetype, piececlass);
    }
  }

  static create(piecetype, ...options) {
    if (!FactionPieceFactory._registeredTypes.has(piecetype)) {
      console.error('FactionPieceFactory could not instantiate piece of unregistered type', piecetype);
      return;
    }

    let myclass = this._registeredTypes.get(piecetype);
    let instance = new myclass(...options);
    return instance;
  }
}

FactionPieceFactory._registeredTypes = new Map();

export default FactionPieceFactory;