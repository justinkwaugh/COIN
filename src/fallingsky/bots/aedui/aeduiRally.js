import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import Rally from '../../commands/rally';
import AeduiTrade from './aeduiTrade';
import AeduiSuborn from './aeduiSuborn';
import FactionActions from '../../../common/factionActions';


class AeduiRally {
    static rally(state, modifiers, bot, aeduiFaction) {
        const executableRallyRegions = AeduiRally.getExecutableRallyRegions(state, modifiers, aeduiFaction);
        if ((aeduiFaction.availableWarbands() <= 10 || executableRallyRegions.length === 0) && !this.isRallyEffective(state, executableRallyRegions)) {
            return false;
        }
        Rally.execute(state, {faction: aeduiFaction, regionResults: executableRallyRegions});
        const usedSpecialAbility = modifiers.canDoSpecial() && (AeduiTrade.trade(state, modifiers, bot) || AeduiSuborn.suborn(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getCitadelRegions(state, modifiers) {
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.AEDUI});
        const citadelRegions = _(rallyRegionResults).filter({canAddCitadel: true}).shuffle().value();
        _.each(citadelRegions,(regionResult) => {
            regionResult.addCitadel = true;
        });
        return _.take(citadelRegions, state.aedui.availableCitadels().length);
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.AEDUI,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions,(regionResult) => {
            regionResult.addAlly = true;
        });
        return _.take(allyRegions, state.aedui.availableAlliedTribes().length);
    }

    static getWarbandRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {factionId: FactionIDs.AEDUI,
            regions: regions
        });
        const warbandRegions = _(rallyRegionResults).filter( result => result.canAddNumWarbands > 0).shuffle().value();
        _.each(warbandRegions, (regionResult) => {
            regionResult.addNumWarbands = regionResult.canAddNumWarbands;
        });
        return warbandRegions;
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

    static getExecutableRallyRegions(state, modifiers, faction) {
        const ralliedRegions = [];
        const citadelRegions = this.getCitadelRegions(state, modifiers);
        ralliedRegions.push.apply(ralliedRegions, _.map(citadelRegions, rallyRegion => rallyRegion.region.id));
        const allyRegions = this.getAllyRegions(state, modifiers, ralliedRegions);
        ralliedRegions.push.apply(ralliedRegions, _.map(allyRegions, rallyRegion => rallyRegion.region.id));
        const warbandRegions = this.getWarbandRegions(state, modifiers, ralliedRegions);

        const allRegions = _(citadelRegions).concat(allyRegions).concat(warbandRegions).value();
        return modifiers.limited ? _.take(allRegions, 1) : allRegions;
    }
}

export default AeduiRally