import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import RevealPieces from '../../actions/revealPieces';
import RemoveResources from '../../actions/removeResources';
import AddResources from '../../actions/addResources';
import Raid from '../../commands/raid';
import AeduiTrade from './aeduiTrade';
import AeduiSuborn from './aeduiSuborn';
import {CapabilityIDs} from '../../config/capabilities';
import FactionActions from '../../../common/factionActions';

class AeduiRaid {
    static raid(state, modifiers) {
        const aedui = state.aedui;
        console.log('*** Are there any effective Aedui Raids? ***');
        const effectiveRaidRegions = this.getEffectiveRaidRegions(state, modifiers);
        if(effectiveRaidRegions.length === 0) {
            return;
        }
        
        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RAID);
        _.each(effectiveRaidRegions, function (raidResult) {
                console.log('*** ' + aedui.name + ' Raiding in region ' + raidResult.region.name);

                RevealPieces.execute(state, {factionId: aedui.id, regionId: raidResult.region.id, count: raidResult.resourcesGained});

                let numResourcesToSteal = raidResult.resourcesGained;
                if (_.indexOf(raidResult.raidableFactions, FactionIDs.ARVERNI) >= 0) {
                    const arverni = state.factionsById[FactionIDs.ARVERNI];
                    let stolenFromArverni = Math.min(numResourcesToSteal, arverni.resources());
                    RemoveResources.execute(state, { factionId: FactionIDs.ARVERNI, count: stolenFromArverni});
                    numResourcesToSteal -= stolenFromArverni;
                }
                else if (_.indexOf(raidResult.raidableFactions, FactionIDs.BELGAE) >= 0) {
                    const belgae = state.factionsById[FactionIDs.BELGAE];
                    let stolenFromBelgae = Math.min(numResourcesToSteal, belgae.resources());
                    RemoveResources.execute(state, { factionId: FactionIDs.BELGAE, count: stolenFromBelgae});
                }
                AddResources.execute(state, { factionId: FactionIDs.AEDUI, count: raidResult.resourcesGained});
            });
        state.turnHistory.getCurrentTurn().commitCommand();
        const usedSpecialAbility = modifiers.canDoSpecial() && (AeduiTrade.trade(state, modifiers) || AeduiSuborn.suborn(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getEffectiveRaidRegions(state, modifiers) {
        const raidResults = Raid.test(state, {factionId: FactionIDs.AEDUI});
        const hasBaggageTrain = state.hasShadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.AEDUI);

        _.each(raidResults, function (result) {
            const numHiddenWarbands = _.filter(result.region.piecesByFaction()[FactionIDs.AEDUI], function (piece) {
                return piece.type === 'warband' && !piece.revealed();
            }).length;

            if(numHiddenWarbands <= 1) {
                result.resourcesGained = 0;
                return;
            }

            const numRaidingWarbands = Math.min(numHiddenWarbands-1, hasBaggageTrain ? 3 : 2);

            if(!result.region.devastated()) {
                result.resourcesGained = numRaidingWarbands;
            }
            else {
                const stealableResources = _.reduce(result.raidableFactions, function(sum, factionId) {
                    if(factionId === FactionIDs.ARVERNI || factionId === FactionIDs.BELGAE) {
                        const faction = state.factionsById[factionId];
                        return sum + faction.resources();
                    }
                    else {
                        return sum;
                    }
                }, 0);
                result.resourcesGained = Math.min(numRaidingWarbands, stealableResources);
            }

            });

        let executable = _(raidResults).filter(function (result) {
                return result.resourcesGained > 0;
            }).sortBy('resourcesGained').value();

        if(modifiers.limited) {
            executable = _.take(executable, 1);
        }

        const numResourcesGained = _.reduce(
            executable, function (sum, result) {
                return sum + result.resourcesGained;
            }, 0);

        if (numResourcesGained > 2) {
            return executable;
        }
        else {
            return [];
        }
    }

}

export default AeduiRaid;