import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import Rally from '../../commands/rally';
import ArverniMarch from './arverniMarch';
import ArverniDevastate from './arverniDevastate';
import ArverniEntreat from './arverniEntreat';
import RemoveResources from 'fallingsky/actions/removeResources';
import FactionActions from '../../../common/factionActions';


class ArverniRally {
    static rally(state, modifiers) {
        const arverni = state.arverni;

        const needWarbands = arverni.availableWarbands().length > 26;
        const executableRallyRegions = this.getExecutableRallyRegions(state, modifiers);
        if (!this.isRallyEffective(state, executableRallyRegions)) {
            if (needWarbands) {
                return ArverniMarch.march(state, modifiers, 'spread', true);
            }
            return false;
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RALLY);
        _.each(executableRallyRegions, (rallyRegion) => {
            if (!modifiers.free && rallyRegion.cost > 0) {
                RemoveResources.execute(state, {factionId: state.arverni.id, count: rallyRegion.cost});
            }
            Rally.execute(state, {faction: state.arverni, regionResult: rallyRegion});
        });

        state.turnHistory.getCurrentTurn().commitCommand();
        const usedSpecialAbility = modifiers.canDoSpecial() && (ArverniDevastate.devastate(state, modifiers) ||
                                                                ArverniEntreat.entreat(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getCitadelRegions(state, modifiers) {
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.ARVERNI});
        const citadelRegions = _(rallyRegionResults).filter({canAddCitadel: true}).shuffle().value();
        _.each(citadelRegions, (regionResult) => {
            regionResult.addCitadel = true;
            const leader = regionResult.region.getLeaderForFaction(FactionIDs.ARVERNI);
            if (leader && !leader.isSuccessor()) {
                regionResult.addNumWarbands = regionResult.canAddNumWarbands;
            }
        });
        return _.take(citadelRegions, state.arverni.availableCitadels().length);
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.ARVERNI,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions, (regionResult) => {
            regionResult.addAlly = true;
            const leader = regionResult.region.getLeaderForFaction(FactionIDs.ARVERNI);
            if (leader && !leader.isSuccessor()) {
                regionResult.addNumWarbands = regionResult.canAddNumWarbands;
            }
        });
        return _.take(allyRegions, state.arverni.availableAlliedTribes().length);
    }

    static getWarbandRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = _.shuffle(Rally.test(state, {
            factionId: FactionIDs.ARVERNI,
            regions: regions
        }));

        let warbandsRemaining = state.arverni.availableWarbands().length;
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
        const arverni = state.arverni;
        let citadelAdded = false;
        let allyAdded = false;
        let numPiecesAdded = 0;
        let numWarbandsAdded = 0;
        _.each(
            executableRallyRegions, (regionResult) => {
                if (regionResult.addCitadel && arverni.availableCitadels().length > 0) {
                    citadelAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                if (regionResult.addAlly && arverni.availableAlliedTribes().length > 0) {
                    allyAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                numWarbandsAdded += regionResult.addNumWarbands;
                if (numPiecesAdded >= 3) {
                    return false;
                }
            });
        const needWarbands = arverni.availableWarbands().length > 26;
        numPiecesAdded += Math.min(numWarbandsAdded, arverni.availableWarbands().length);
        return (needWarbands && numPiecesAdded > 0) || citadelAdded || allyAdded || numPiecesAdded >= 3;
    }

    static getExecutableRallyRegions(state, modifiers, faction) {
        const ralliedRegions = [];
        const citadelRegions = this.getCitadelRegions(state, modifiers);
        ralliedRegions.push.apply(ralliedRegions, _.map(citadelRegions, rallyRegion => rallyRegion.region.id));
        const allyRegions = this.getAllyRegions(state, modifiers, ralliedRegions);
        ralliedRegions.push.apply(ralliedRegions, _.map(allyRegions, rallyRegion => rallyRegion.region.id));
        const warbandRegions = this.getWarbandRegions(state, modifiers, ralliedRegions);

        const allRegions = _(citadelRegions).concat(allyRegions).concat(warbandRegions).filter(rallyRegion => _.indexOf(modifiers.allowedRegions, rallyRegion.region.id) >= 0).value();
        const affordableRegions = modifiers.free ? allRegions : _.reduce(allRegions, (accumulator, rallyRegion) => {
            if (accumulator.resourcesRemaining >= rallyRegion.cost) {
                accumulator.resourcesRemaining -= rallyRegion.cost;
                accumulator.rallies.push(rallyRegion);
            }
            return accumulator
        }, {resourcesRemaining: state.arverni.resources(), rallies: []}).rallies;

        return modifiers.limited ? _.take(affordableRegions, 1) : affordableRegions;
    }

}

export default ArverniRally