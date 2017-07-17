import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import Rally from '../../commands/rally';
import AeduiTrade from './aeduiTrade';
import AeduiSuborn from './aeduiSuborn';
import RemoveResources from 'fallingsky/actions/removeResources'
import FactionActions from '../../../common/factionActions';

const Checkpoints = {
    RALLY_COMPLETE_CHECK: 'rcc'
};

class AeduiRally {
    static rally(state, modifiers) {
        const aeduiFaction = state.aedui;
        const turn = state.turnHistory.getCurrentTurn();

        if (!turn.getCheckpoint(Checkpoints.RALLY_COMPLETE_CHECK)) {
            console.log('*** Are there any effective Aedui Rallies? ***');
            const executableRallyRegions = AeduiRally.getExecutableRallyRegions(state, modifiers, aeduiFaction);
            if ((aeduiFaction.availableWarbands() <= 10 || executableRallyRegions.length === 0) && !this.isRallyEffective(
                    state, executableRallyRegions)) {
                return false;
            }
            turn.startCommand(CommandIDs.RALLY);
            _.each(executableRallyRegions, (rallyRegion) => {
                if (!modifiers.free && rallyRegion.cost > 0) {
                    RemoveResources.execute(state, {factionId: aeduiFaction.id, count: rallyRegion.cost});
                }
                Rally.execute(state, {faction: aeduiFaction, regionResult: rallyRegion});
            });

            turn.commitCommand();
        }

        turn.markCheckpoint(Checkpoints.RALLY_COMPLETE_CHECK);
        const usedSpecialAbility = modifiers.canDoSpecial() && (AeduiTrade.trade(state,
                                                                                 modifiers) || AeduiSuborn.suborn(state,
                                                                                                                  modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getCitadelRegions(state, modifiers) {
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.AEDUI});
        const citadelRegions = _(rallyRegionResults).filter({canAddCitadel: true}).shuffle().value();
        _.each(citadelRegions, (regionResult) => {
            regionResult.addCitadel = true;
        });
        return _.take(citadelRegions, state.aedui.availableCitadels().length);
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.AEDUI,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions, (regionResult) => {
            regionResult.addAlly = true;
        });
        return _.take(allyRegions, state.aedui.availableAlliedTribes().length);
    }

    static getWarbandRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = _.shuffle(Rally.test(state, {
            factionId: FactionIDs.AEDUI,
            regions: regions
        }));

        let warbandsRemaining = state.aedui.availableWarbands().length;
        _.each(rallyRegionResults, (regionResult) => {
            regionResult.addNumWarbands = Math.min(regionResult.canAddNumWarbands, warbandsRemaining);
            warbandsRemaining -= regionResult.addNumWarbands;
            if(warbandsRemaining === 0) {
                return false;
            }
        });

        return _(rallyRegionResults).filter(result => result.addNumWarbands > 0).shuffle().value();
    }

    static isRallyEffective(state, executableRallyRegions) {
        const aedui = state.aedui;
        let citadelAdded = false;
        let allyAdded = false;
        let numPiecesAdded = 0;
        let numWarbandsAdded = 0;
        _.each(
            executableRallyRegions, function (regionResult) {
                if (regionResult.addCitadel && aedui.availableCitadels().length > 0) {
                    citadelAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                if (regionResult.addAlly && aedui.availableAlliedTribes().length > 0) {
                    allyAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                numWarbandsAdded += regionResult.addNumWarbands;
                if (numPiecesAdded >= 3) {
                    return false;
                }
            });

        numPiecesAdded += Math.min(numWarbandsAdded, aedui.availableWarbands().length);
        return citadelAdded || allyAdded || numPiecesAdded >= 3;
    }

    static getExecutableRallyRegions(state, modifiers) {
        const ralliedRegions = [];
        const citadelRegions = this.getCitadelRegions(state, modifiers);
        ralliedRegions.push.apply(ralliedRegions, _.map(citadelRegions, rallyRegion => rallyRegion.region.id));
        const allyRegions = this.getAllyRegions(state, modifiers, ralliedRegions);
        ralliedRegions.push.apply(ralliedRegions, _.map(allyRegions, rallyRegion => rallyRegion.region.id));
        const warbandRegions = this.getWarbandRegions(state, modifiers, ralliedRegions);

        const allRegions = _(citadelRegions).concat(allyRegions).concat(warbandRegions).value();
        const affordableRegions = modifiers.free ? allRegions : _.reduce(allRegions, (accumulator, rallyRegion) => {
            if (accumulator.resourcesRemaining >= rallyRegion.cost) {
                accumulator.resourcesRemaining -= rallyRegion.cost;
                accumulator.rallies.push(rallyRegion);
            }
            return accumulator
        }, {resourcesRemaining: state.aedui.resources(), rallies: []}).rallies;

        return modifiers.limited ? _.take(affordableRegions, 1) : affordableRegions;
    }
}

export default AeduiRally