
class GameState {
    constructor() {

    }

    toJSON() {
        return {};
    }

    serializeGameState(state) {
        return JSON.stringify(state, function (key, val) {
            var getType = {};
            if (val && getType.toString.call(val) === '[object Function]') return undefined;
            return val;
          }, 1);
    }
    
    cloneGameState(clonestate = null) {
      if (clonestate === null)
        clonestate = new GameState();
      // nothing here to clone
      return clonestate;
    }

    loadGameState(json) {
        // nothing to load for GameState
    }
}

export default GameState;