import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
class Losses {

    static calculateUnmodifiedLosses(state, attackingPieces, counterattack) {
        let losses = 0;
        const leader = _.find(attackingPieces, {type: 'leader'});

        _.each(
            attackingPieces, function (piece) {
                if (piece.type === 'warband') {
                    if (!counterattack && leader && !leader.isSuccessor() && piece.factionId === FactionIDs.BELGAE) {
                        losses += 1;
                    }
                    else {
                        losses += 0.5;
                    }
                }
                else if (piece.type === 'auxilia') {
                    losses += 0.5;
                }
                else if (piece.type === 'legion') {
                    if (!counterattack && leader && !leader.isSuccessor() && piece.factionId === FactionIDs.ROMANS) {
                        losses += 2;
                    }
                    else {
                        losses += 1;
                    }
                }
                else if (piece.type === 'leader') {
                    losses += 1;
                }
            });

        const useVercingetorixElite = leader && leader.factionId === FactionIDs.ARVERNI && !leader.isSuccessor() &&
                                      state.hasShadedCapability(CapabilityIDs.VERCINGETORIXS_ELITE);
        const numWarbands = _.filter(attackingPieces, {type: 'warband'}).length;
        if (useVercingetorixElite && numWarbands > 0) {
            losses += Math.min(numWarbands, 2);
        }

        return losses;
    }

    static orderPiecesForRemoval(state, pieces, retreat) {
        const alliesFortsAndCitadels = _(pieces).filter(
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

        const warbandsAuxiliaLegionsAndLeader = _(pieces).filter(
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

    static orderPiecesRollsFirst(pieces, retreat) {
        const alliesFortsAndCitadels = _(pieces).filter(
            (piece) => {
                return piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel';
            }).sortBy(
            (piece) => {
                if (piece.type === 'fort' || piece.type === 'citadel') {
                    return 'a';
                }
                else {
                    return 'b';
                }
            }).value();

        const warbandsAuxiliaLegionsAndLeader = _(pieces).filter(
            (piece) => {
                return piece.type === 'warband' || piece.type === 'auxilia' || piece.type === 'legion' || piece.type === 'leader';
            }).sortBy(
            (piece) => {
                if (piece.type === 'legion' || piece.type === 'leader') {
                    return 'a';
                }
                else {
                    return 'b';
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

export default Losses;