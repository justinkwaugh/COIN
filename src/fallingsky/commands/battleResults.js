import _ from '../../lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds'
import Logging from '../util/logging';

class BattleResults {
    constructor(definition) {
        this.region = definition.region;
        this.cost = definition.cost;

        this.attackingFaction = definition.attackingFaction;
        this.defendingFaction = definition.defendingFaction;
        this.attackingPieces = definition.attackingPieces;
        this.defendingPieces = definition.defendingPieces;

        this.canAmbush = definition.canAmbush;
        this.canEnlistGermans = definition.canEnlistGermans;
        this.defenderCanRetreat = definition.defenderCanRetreat;
        this.defenderCanGuaranteeSafeRetreat = definition.defenderCanGuaranteeSafeRetreat;
        this.defenderCanCounterattack = definition.defenderCanCounterattack;

        this.defenderLosses = definition.defenderLosses;

        this.worstCaseRetreatDefenderResults = definition.worstCaseRetreatDefenderResults;
        this.worstCaseNoRetreatDefenderResults = definition.worstCaseNoRetreatDefenderResults;
        this.worstCaseDefenderLosses = definition.worstCaseDefenderLosses;
        this.worstCaseAttackerLosses = definition.worstCaseAttackerLosses;
        this.worstCaseCounterattackResults = definition.worstCaseCounterattackResults;

        this.willAmbush = definition.willAmbush;
        this.willEnlistGermans = definition.willEnlistGermans;
        this.willBesiege = definition.willBesiege;
        this.willApplyGermanicHorse = definition.willApplyGermanicHorse;
        this.willApplyBalearicSlingers = definition.willApplyBalearicSlingers;

        this.paid = definition.paid;
        this.handledBalearicSlingers = definition.handledBalearicSlingers;
        this.handledMassedGallicArchers = definition.handledMassedGallicArchers;
        this.willRetreat = definition.willRetreat;
        this.retreated = definition.retreated;
        this.besieged = definition.besieged;
        this.calculatedDefenderResults = definition.calculatedDefenderResults;
        this.committedDefenderResults = definition.committedDefenderResults;
        this.complete = definition.complete;
    }

    mostDefenderLosses() {
        return (this.defenderCanGuaranteeSafeRetreat && !this.canAmbush) ? this.defenderLosses.retreat : this.defenderLosses.normal;
    }

    willCauseLeaderRemoval(ambush = false) {
        return this.willCauseRemovalOfPieceOfType('leader', ambush);
    }

    willCauseAllyRemoval(ambush = false) {
        return this.willCauseRemovalOfPieceOfType('alliedtribe', ambush);
    }

    willCauseCitadelRemoval(ambush = false) {
        return this.willCauseRemovalOfPieceOfType('citadel', ambush);
    }

    willCauseLegionRemoval(ambush = false) {
        return this.willCauseRemovalOfPieceOfType('legion', ambush);
    }

    willCauseRemovalOfPieceOfType(type, ambush) {
        const foundWithoutRetreat = _.find(this.worstCaseNoRetreatDefenderResults.ambush.targets, {type: type});
        let foundWithRetreat = true;
        if (!ambush && this.defenderCanRetreat) {
            foundWithRetreat = _.find(this.worstCaseRetreatDefenderResults.targets, {type: type});
        }
        return foundWithoutRetreat && foundWithRetreat;
    }

    willInflictLossAgainstLeader(ambush = false) {
        return this.willInflictLossAgainstPieceOfType('leader', ambush);
    }

    willInflictLossAgainstAlly(ambush = false) {
        return this.willInflictLossAgainstPieceOfType('alliedtribe', ambush);
    }

    willInflictLossAgainstCitadel(ambush = false) {
        return this.willInflictLossAgainstPieceOfType('citadel', ambush);
    }

    willInflictLossAgainstLegion(ambush = false) {
        return this.willInflictLossAgainstPieceOfType('legion', ambush);
    }

    willInflictCounterattackLossAgainstLegion() {
        return this.willInflictLossAgainstPieceOfType('legion', false, true);
    }

    willInflictLossAgainstPieceOfType(type, ambush, counterattack = false) {
        // Make this more clever
        let inflictedLoss = true;
        const pieces = counterattack ? this.attackingPieces : this.defendingPieces;
        const normalOrderedLossTargets = _(pieces).sortBy((piece) => {
            let prefix;

            if (piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel') {
                prefix = 'b';
            }
            else {
                prefix = 'a';
            }

            return prefix + (piece.type === type ? 2 : 1);
        }).take(counterattack ? this.worstCaseAttackerLosses.normal : this.defenderLosses.normal).value();

        inflictedLoss = inflictedLoss && !_.isUndefined(_.find(normalOrderedLossTargets, {type: type}));

        if (this.defenderCanRetreat && !counterattack && !ambush) {
            const retreatOrderedLossTargets = _(pieces).sortBy((piece) => {
                let prefix;

                if (piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel') {
                    prefix = 'a';
                }
                else {
                    prefix = 'b';
                }

                return prefix + (piece.type === type ? 2 : 1);
            }).take(this.defenderLosses.retreat).value();
            inflictedLoss = inflictedLoss && !_.isUndefined(_.find(retreatOrderedLossTargets, {type: type}));
        }

        return inflictedLoss;
    }

    getNumLossesAgainstPiecesOfType(type, ambush = false, rollsFail = false) {
        const normalResults = this.calcNumLossesAgainstPiecesOfType(type, ambush, false, rollsFail);
        let worstResults = normalResults;
        if(normalResults.length > 0 && this.defenderCanRetreat && !ambush) {
            const retreatResults = this.calcNumLossesAgainstPiecesOfType(type, false, true, rollsFail);
            if(retreatResults[0].numLosses < normalResults[0].numLosses) {
                worstResults = retreatResults;
            }
        }

        return worstResults;
    }

    calcNumLossesAgainstPiecesOfType(type, ambush=false, retreat=false, rollsFail = false) {
        const leader = _.find(this.defendingPieces, {type : 'leader'});
        const hasCaesar = leader && leader.factionId === FactionIDs.ROMANS && !leader.isSuccessor();

        const normalOrderedLossTargets = _(this.defendingPieces).sortBy((piece) => {
            let prefix;

            if (piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel') {
                prefix = retreat ? 'a' :'b';
            }
            else {
                prefix = retreat ? 'b' :'a';
            }

            return prefix + (piece.type === type ? 2 : 1);
        }).take(retreat ? this.defenderLosses.retreat : this.defenderLosses.normal).value();

        const index = _.findIndex(normalOrderedLossTargets, {type:type});

        let noLosses = false;
        let noLossesAfterFirst = false;

        if(!rollsFail && (!ambush || hasCaesar)) {
            if(index > 0) {
                const earlierPieces = _.take(normalOrderedLossTargets, index);
                if (_.find(earlierPieces, {canRoll: true})) {
                    noLosses = true;
                }
            }

            if(index === 0 && normalOrderedLossTargets[0].canRoll) {
                noLossesAfterFirst = true;
            }
        }

        return _(this.defendingPieces).map((piece, pieceIndex) => {
            if(piece.type !== type) {
                return;
            }

            let numLosses = pieceIndex < (retreat ? this.defenderLosses.retreat : this.defenderLosses.normal) ? 1 : 0;
            if(noLosses) {
                numLosses = 0
            }
            else if(noLossesAfterFirst && pieceIndex > index) {
                numLosses = 0;
            }
            else if(noLossesAfterFirst && pieceIndex === index) {
                numLosses = this.defenderLosses.normal - pieceIndex;
            }

            return {
                piece,
                numLosses
            }
        }).compact().value();
    }

    logResults() {
        console.log(
            '*** Battle - ' + this.attackingFaction.name + ' attacks ' + this.defendingFaction.name + ' in region ' + this.region.name);
        console.log('    *** Normal Possibilities ***');
        console.log(
            '    With retreat ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseRetreatDefenderResults.targets.length + ' pieces');
        Logging.logPieces(this.worstCaseRetreatDefenderResults.targets);
        console.log(
            '    Without retreat ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseNoRetreatDefenderResults.normal.targets.length + ' pieces');
        Logging.logPieces(this.worstCaseNoRetreatDefenderResults.normal.targets);
        console.log(
            '    If counterattacked ' + this.attackingFaction.name + ' will lose the following ' + this.worstCaseAttackerLosses.normal + ' pieces');
        Logging.logPieces(this.worstCaseCounterattackResults.normal.targets);
        if (this.canAmbush) {
            console.log('    *** Ambush Possibilities ***');
            console.log(
                '    ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseNoRetreatDefenderResults.ambush.targets.length + ' pieces');
            Logging.logPieces(this.worstCaseNoRetreatDefenderResults.ambush.targets);
            console.log(
                '    If counterattacked ' + this.attackingFaction.name + ' will lose the following ' + this.worstCaseAttackerLosses.ambush + ' pieces');
            Logging.logPieces(this.worstCaseCounterattackResults.ambush.targets);
        }
    }
}

export default BattleResults;