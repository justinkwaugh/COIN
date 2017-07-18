import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import Rally from '../../commands/rally';
import BelgaeRampage from './belgaeRampage';
import BelgaeEnlist from './belgaeEnlist';
import RemoveResources from 'fallingsky/actions/removeResources';
import FactionActions from '../../../common/factionActions';


class BelgaeRally {
    static rally(state, modifiers) {

        const executableRallyRegions = this.getExecutableRallyRegions(state, modifiers);
        if (!this.isRallyEffective(state, executableRallyRegions)) {
            return false;
        }
        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RALLY);
        _.each(executableRallyRegions, (rallyRegion) => {
            if (!modifiers.free && rallyRegion.cost > 0) {
                RemoveResources.execute(state, {factionId: state.belgae.id, count: rallyRegion.cost});
            }
            Rally.execute(state, {faction: state.belgae, regionResult: rallyRegion});
        });

        state.turnHistory.getCurrentTurn().commitCommand();
        const usedSpecialAbility = modifiers.canDoSpecial() && (BelgaeRampage.rampage(state, modifiers) ||
                                                                BelgaeEnlist.enlist(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getCitadelRegions(state, modifiers) {
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.BELGAE});
        const citadelRegions = _(rallyRegionResults).filter({canAddCitadel: true}).shuffle().value();
        _.each(citadelRegions, (regionResult) => {
            regionResult.addCitadel = true;
        });
        return _.take(citadelRegions, state.belgae.availableCitadels().length);
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.BELGAE,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions, (regionResult) => {
            regionResult.addAlly = true;
        });
        return _.take(allyRegions, state.belgae.availableAlliedTribes().length);
    }

    static getWarbandRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.BELGAE,
            regions: regions
        });

        const warbandRegions = _(rallyRegionResults).filter(result => result.canAddNumWarbands > 0).map(
            (regionResult) => {
                const controlMargin = regionResult.region.controllingMarginByFaction()[FactionIDs.BELGAE];
                let priority = null;
                if (controlMargin <= 0 && (controlMargin + regionResult.canAddNumWarbands) > 0) {
                    priority = 'c' + (99 - regionResult.canAddNumWarbands);
                    regionResult.willAddControl = true;
                }
                else {
                    priority = 'd' + (99 - regionResult.canAddNumWarbands);
                }
                return {priority, regionResult};
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('regionResult').value();

        let warbandsRemaining = state.belgae.availableWarbands().length;
        _.each(rallyRegionResults, (regionResult) => {
            regionResult.addNumWarbands = Math.min(regionResult.canAddNumWarbands, warbandsRemaining);
            warbandsRemaining -= regionResult.addNumWarbands;
            if (warbandsRemaining === 0) {
                return false;
            }
        });

        return _(rallyRegionResults).filter(result => result.addNumWarbands > 0).value();
    }

    static isRallyEffective(state, executableRallyRegions) {
        const belgae = state.belgae;
        let citadelAdded = false;
        let allyAdded = false;
        let controlAdded = false;
        let numPiecesAdded = 0;
        let numWarbandsAdded = 0;
        _.each(
            executableRallyRegions, (regionResult) => {
                if (regionResult.addCitadel && belgae.availableCitadels().length > 0) {
                    citadelAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                if (regionResult.addAlly && belgae.availableAlliedTribes().length > 0) {
                    allyAdded = true;
                    numPiecesAdded += 1;
                    return false;
                }

                if (regionResult.willAddControl) {
                    controlAdded = true;
                }

                numWarbandsAdded += regionResult.addNumWarbands;
                if (numPiecesAdded >= 3) {
                    return false;
                }
            });

        numPiecesAdded += Math.min(numWarbandsAdded, belgae.availableWarbands().length);
        return citadelAdded || allyAdded || numPiecesAdded >= 3 || controlAdded;
    }

    static getExecutableRallyRegions(state, modifiers) {
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
        }, {resourcesRemaining: state.belgae.resources(), rallies: []}).rallies;

        return modifiers.limited ? _.take(affordableRegions, 1) : affordableRegions;
    }

}

export default BelgaeRally