import Logging from '../util/logging';
import Action from './action';

class MovePieces extends Action {

    constructor(args) {
        super(args);

        this.sourceRegionId = args.sourceRegionId;
        this.destRegionId = args.destRegionId;
        this.pieces = args.pieces;
    }

    doExecute(state) {
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        const pieces = this.pieces;

        const factionId = pieces[0].factionId;
        sourceRegion.removePieces(pieces);
        destRegion.addPieces(pieces);

        console.log('Moving the following ' + factionId + ' pieces from region ' + sourceRegion.name + ' to ' + destRegion.name);
        Logging.logPieces(pieces);
    }

    doUndo(state) {
        throw 'Unable to undo MovePieces Action';
    }

}

export default MovePieces;