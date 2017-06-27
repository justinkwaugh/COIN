import _ from '../../../lib/lodash';
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
    static raid(currentState, modifiers, bot, aeduiFaction, executableRaidRegions) {
        _.each(executableRaidRegions, function (raidResult) {
                console.log('*** ' + aeduiFaction.name + ' Raiding in region ' + raidResult.region.name);

                RevealPieces.execute(currentState, {factionId: aeduiFaction.id, regionId: raidResult.region.id, count: raidResult.resourcesGained});

                let numResourcesToSteal = raidResult.resourcesGained;
                if (_.indexOf(raidResult.raidableFactions, FactionIDs.ARVERNI) >= 0) {
                    const arverni = currentState.factionsById[FactionIDs.ARVERNI];
                    let stolenFromArverni = Math.min(numResourcesToSteal, arverni.resources());
                    RemoveResources.execute(currentState, { factionId: FactionIDs.ARVERNI, count: stolenFromArverni});
                    numResourcesToSteal -= stolenFromArverni;
                }
                else if (_.indexOf(raidResult.raidableFactions, FactionIDs.BELGAE) >= 0) {
                    const belgae = currentState.factionsById[FactionIDs.BELGAE];
                    let stolenFromBelgae = Math.min(numResourcesToSteal, belgae.resources());
                    RemoveResources.execute(currentState, { factionId: FactionIDs.BELGAE, count: stolenFromBelgae});
                }
                AddResources.execute(currentState, { factionId: FactionIDs.AEDUI, count: raidResult.resourcesGained});
            });

        const usedSpecialAbility = modifiers.canDoSpecial() && (AeduiTrade.trade(currentState, modifiers, bot) || AeduiSuborn.suborn(currentState, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getEffectiveRaidRegions(currentState, modifiers) {
        const raidResults = Raid.test(currentState, {factionId: FactionIDs.AEDUI});
        const hasBaggageTrain = currentState.hasShadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.AEDUI);

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
                        const faction = currentState.factionsById[factionId];
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