import _ from 'lib/lodash';

class Debug {

    static checkForPiecesInTwoRegions(state) {
        const regionsForPieceId = {};
        _.each(state.regions, region => {
            const pieces = region.pieces();
            _.each(pieces, piece=> {
                const existingRegionId = regionsForPieceId[piece.id];
                if(existingRegionId) {
                    throw Error('Piece ' + piece.id + ' already found in region ' + existingRegionId);
                }
                regionsForPieceId[piece.id] = region.id;
            })
        })
    }

}

export default Debug;