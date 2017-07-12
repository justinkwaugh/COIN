import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
class Losses {

    static calculateUnmodifiedLosses(state, attackingFaction, attackingPieces, counterattack=false, germanicHorse=false) {
        let losses = 0;
        const leader = _.find(attackingPieces, {type: 'leader'});
        let usedLegioXLegion = false;
        _.each(
            attackingPieces, function (piece) {
                if (piece.type === 'warband') {
                    if (!counterattack && leader && !leader.isSuccessor() && attackingFaction.id === FactionIDs.BELGAE) {
                        losses += 1;
                    }
                    else {
                        losses += 0.5;
                    }
                }
                else if (piece.type === 'auxilia') {
                    losses += germanicHorse && state.hasUnshadedCapability(CapabilityIDs.GERMANIC_HORSE) ? 1 : 0.5;
                }
                else if (piece.type === 'legion') {
                    if (!counterattack && leader && !leader.isSuccessor() && piece.factionId === FactionIDs.ROMANS && !usedLegioXLegion) {
                        losses += 2;
                        if(state.hasShadedCapability(CapabilityIDs.LEGIO_X)) {
                            usedLegioXLegion = true;
                        }
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

    static orderPiecesForRemoval(state, pieces, retreat, helpingFactionId) {
        const alliesFortsAndCitadels = _(pieces).filter(
            function (piece) {
                return piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel';
            }).sortBy(
            function (piece) {
                if (piece.type === 'alliedtribe') {
                    if(piece.factionId === helpingFactionId) {
                        return 'a'
                    }

                    const tribe = state.tribesById[piece.tribeId];
                    if (!tribe.isCity) {
                        return 'b';
                    }
                    else {
                        return 'c';
                    }
                }
                else if (piece.type === 'fort') {
                    return 'd';
                }
                else if (piece.type === 'citadel') {
                    return 'e';
                }
            }).value();

        const warbandsAuxiliaLegionsAndLeader = _(pieces).filter(
            function (piece) {
                return piece.type === 'warband' || piece.type === 'auxilia' || piece.type === 'legion' || piece.type === 'leader';
            }).sortBy(
            function (piece) {
                if (piece.type === 'warband' || piece.type === 'auxilia') {
                    if(piece.factionId === helpingFactionId) {
                        return 'a'
                    }
                    if (piece.scouted()) {
                        return 'b';
                    }
                    else if (piece.revealed()) {
                        return 'c';
                    }
                    else {
                        return 'd';
                    }

                }
                else if (piece.type === 'legion') {
                    return 'e';
                }
                else if (piece.type === 'leader') {
                    return 'f';
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