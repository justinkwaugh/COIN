import _ from '../../lib/lodash';
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
        this.defenderCanCounterattack = definition.defenderCanCounterattack;
        this.worstCaseRetreatDefenderResults = definition.worstCaseRetreatDefenderResults;
        this.worstCaseNoRetreatDefenderResults = definition.worstCaseNoRetreatDefenderResults;
        this.worstCaseDefenderLosses = definition.worstCaseDefenderLosses;
        this.worstCaseAttackerLosses = definition.worstCaseAttackerLosses;
        this.worstCaseCounterattackResults = definition.worstCaseCounterattackResults;

        this.willAmbush = definition.willAmbush;
        this.willEnlistGermans = definition.willEnlistGermans;

        this.willRetreat = definition.willRetreat;
        this.retreated = definition.retreated;
        this.calculatedDefenderResults = definition.calculatedDefenderResults;
        this.committedDefenderResults = definition.committedDefenderResults;
        this.complete = definition.complete;
    }

    willCauseLeaderLoss(ambush=false) {
        return this.willCauseLossOfPieceOfType('leader',ambush);
    }

    willCauseAllyLoss(ambush=false) {
        return this.willCauseLossOfPieceOfType('alliedtribe',ambush);
    }

    willCauseCitadelLoss(ambush=false) {
        return this.willCauseLossOfPieceOfType('citadel',ambush);
    }

    willCauseLegionLoss(ambush=false) {
        return this.willCauseLossOfPieceOfType('legion',ambush);
    }

    willCauseLossOfPieceOfType(type, ambush) {
        const foundWithoutRetreat = _.find(this.worstCaseNoRetreatDefenderResults.ambush.targets, {type:type});
        let foundWithRetreat = true;
        if(!ambush && this.defenderCanRetreat) {
            foundWithRetreat = _.find(this.worstCaseRetreatDefenderResults.targets, {type:type});
        }
        return foundWithoutRetreat && foundWithRetreat;
    }

    logResults() {
        console.log('*** Battle - ' + this.attackingFaction.name + ' attacks ' + this.defendingFaction.name + ' in region ' + this.region.name);
        console.log('    *** Normal Possibilities ***');
        console.log('    With retreat ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseRetreatDefenderResults.targets.length + ' pieces');
        Logging.logPieces(this.worstCaseRetreatDefenderResults.targets);
        console.log('    Without retreat ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseNoRetreatDefenderResults.normal.targets.length + ' pieces');
        Logging.logPieces(this.worstCaseNoRetreatDefenderResults.normal.targets);
        console.log('    If counterattacked ' + this.attackingFaction.name + ' will lose the following ' + this.worstCaseAttackerLosses.normal + ' pieces');
        Logging.logPieces(this.worstCaseCounterattackResults.normal.targets);
        if (this.canAmbush) {
            console.log('    *** Ambush Possibilities ***');
            console.log('    ' + this.defendingFaction.name + ' will lose the following ' + this.worstCaseNoRetreatDefenderResults.ambush.targets.length + ' pieces');
            Logging.logPieces(this.worstCaseNoRetreatDefenderResults.ambush.targets);
            console.log('    If counterattacked ' + this.attackingFaction.name + ' will lose the following ' + this.worstCaseAttackerLosses.ambush + ' pieces');
            Logging.logPieces(this.worstCaseCounterattackResults.ambush.targets);
        }
    }
}

export default BattleResults;