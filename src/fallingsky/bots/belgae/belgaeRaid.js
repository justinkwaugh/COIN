import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import RevealPieces from '../../actions/revealPieces';
import RemoveResources from '../../actions/removeResources';
import AddResources from '../../actions/addResources';
import Raid from '../../commands/raid';
import BelgaeRampage from './belgaeRampage';
import BelgaeEnlist from './belgaeEnlist';
import {CapabilityIDs} from '../../config/capabilities';
import FactionActions from '../../../common/factionActions';
import EnemyFactionPriority from './enemyFactionPriority';

class BelgaeRaid {
    static raid(state, modifiers) {

        const effectiveRaidRegions = this.getEffectiveRaidRegions(state, modifiers);
        if(effectiveRaidRegions.length === 0) {
            return;
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RAID);
        _.each(
            effectiveRaidRegions, function (raidResult) {
                console.log('*** ' + state.belgae.name + ' Raiding in region ' + raidResult.region.name);

                RevealPieces.execute(
                    state, {
                        factionId: state.belgae.id,
                        regionId: raidResult.region.id,
                        count: raidResult.resourcesGained
                    });

                let numResourcesToSteal = raidResult.resourcesGained;
                _(raidResult.raidableFactions).sortBy(factionId => EnemyFactionPriority[factionId]).each(
                    (factionId) => {
                        if (state.playersByFaction[factionId].isNonPlayer) {
                            return;
                        }
                        const faction = state.factionsById[factionId];
                        const stolen = Math.min(numResourcesToSteal, faction.resources());
                        RemoveResources.execute(state, { factionId: faction.id, count: stolen});
                        numResourcesToSteal -= stolen;

                        if (numResourcesToSteal === 0) {
                            return false;
                        }
                    });

                AddResources.execute(state, { factionId: FactionIDs.BELGAE, count: raidResult.resourcesGained});
            });

        state.turnHistory.getCurrentTurn().commitCommand();
        const usedSpecialAbility = modifiers.canDoSpecial() && (BelgaeRampage.rampage(state, modifiers) || BelgaeEnlist.enlist(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getEffectiveRaidRegions(state, modifiers) {
        const raidResults = _.filter(Raid.test(state, {factionId: FactionIDs.BELGAE}), raid=> _.indexOf(modifiers.allowedRegions, raid.region.id) >= 0);
        const hasBaggageTrain = state.hasShadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.BELGAE);
        const warbandsPerRegion = modifiers.context.warbandsPerRegion || {};
        _.each(
            raidResults, function (result) {
                const numHiddenWarbands = warbandsPerRegion[result.region.id] || result.region.getHiddenPiecesForFaction(FactionIDs.BELGAE).length;

                if (numHiddenWarbands <= 1) {
                    result.resourcesGained = 0;
                    return;
                }

                const numRaidingWarbands = Math.min(numHiddenWarbands - 1, hasBaggageTrain ? 3 : 2);

                if (!result.region.devastated()) {
                    result.resourcesGained = numRaidingWarbands;
                }
                else {
                    const stealableResources = _.reduce(
                        result.raidableFactions, function (sum, factionId) {
                            if (!state.playersByFaction[factionId].isNonPlayer) {
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

        let executable = _(raidResults).filter(result => result.resourcesGained > 0).sortBy(
            (result) => {
                let priority = 'z';
                _.each(
                    result.raidableFactions, (factionId) => {
                        if (!state.playersByFaction[factionId].isNonPlayer) {
                            const factionPriority = 'a' + EnemyFactionPriority[factionId];
                            if (factionPriority < priority) {
                                priority = factionPriority;
                            }
                        }
                    });
                priority += '-' + result.resourcesGained;
                return {
                    priority,
                    result
                }
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();

        if (modifiers.limited) {
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

export default BelgaeRaid;