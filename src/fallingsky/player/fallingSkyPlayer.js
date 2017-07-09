import Player from 'common/player';

class FallingSkyPlayer extends Player {

    constructor(definition) {
        super(definition);
    }

    willHarass(factionId) {
        return true;
    }

    willAgreeToQuarters(state, factionId) {
        return false;
    }

    willAgreeToRetreat(state, factionId) {
        return false;
    }

    willAgreeToSupplyLine(state, factionId) {
        return false;
    }

    orderPiecesForRemoval(state, factionPieces, retreat) {
        const alliesFortsAndCitadels = _(factionPieces).filter(
            function (piece) {
                return piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel';
            }).sortBy(
            function (piece) {
                if (piece.type === 'alliedtribe') {
                    const tribe = state.tribesById[piece.tribeId];
                    if (!tribe.isCity) {
                        return 'a';
                    }
                    else {
                        return 'b';
                    }
                }
                else if (piece.type === 'fort') {
                    return 'c';
                }
                else if (piece.type === 'citadel') {
                    return 'd';
                }
            }).value();

        const warbandsAuxiliaLegionsAndLeader = _(factionPieces).filter(
            function (piece) {
                return piece.type === 'warband' || piece.type === 'auxilia' || piece.type === 'legion' || piece.type === 'leader';
            }).sortBy(
            function (piece) {
                if (piece.type === 'warband' || piece.type === 'auxilia') {
                    if (piece.scouted()) {
                        return 'a';
                    }
                    else if (piece.revealed()) {
                        return 'b';
                    }
                    else {
                        return 'c';
                    }

                }
                else if (piece.type === 'legion') {
                    return 'd';
                }
                else if (piece.type === 'leader') {
                    return 'e';
                }
            }).value();

        let piecesForRemoval = [];
        if (retreat) {
            piecesForRemoval = _.concat(alliesFortsAndCitadels, warbandsAuxiliaLegionsAndLeader);
        }
        else {
            piecesForRemoval = _.concat(warbandsAuxiliaLegionsAndLeader, alliesFortsAndCitadels);
        }
        return piecesForRemoval;
    }

}

export default FallingSkyPlayer;

