import Logging from '../util/logging';
import Action from './action';

class MovePieces extends Action {

    static execute(state, args) {
        const sourceRegion = args.sourceRegion;
        const destRegion = args.destRegion;
        const pieces = args.pieces;

        const factionId = pieces[0].factionId;
        sourceRegion.removePieces(pieces);
        destRegion.addPieces(pieces);

        console.log('Moving the following ' + factionId + ' pieces from region ' + sourceRegion.name + ' to ' + destRegion.name);
        Logging.logPieces(pieces);
    }
}

export default MovePieces;