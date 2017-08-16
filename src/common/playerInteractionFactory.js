import PlayerInteraction from './playerInteraction';

class PlayerInteractionFactory {
  constructor() {
  }

  static register(piecetype, piececlass) {
    if ((!PlayerInteractionFactory._registeredTypes.has(piecetype))) {
      PlayerInteractionFactory._registeredTypes.set(piecetype, piececlass);
    }
  }

  static create(piecetype, ...options) {
    if (!PlayerInteractionFactory._registeredTypes.has(piecetype)) {
      console.error('FactionPieceFactory could not instantiate piece of unregistered type', piecetype);
      return;
    }

    let myclass = this._registeredTypes.get(piecetype);
    let instance = new myclass(...options);
    return instance;
  }
}

PlayerInteractionFactory._registeredTypes = new Map();

export default PlayerInteractionFactory;