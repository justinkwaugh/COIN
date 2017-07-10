import _ from '../../../lib/lodash';
import Entreat from '../../commands/arverni/entreat';
import RemoveResources from '../../actions/removeResources';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionIDs from '../../config/factionIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import Losses from 'fallingsky/util/losses';

class ArverniEntreat {

    static entreat(state, modifiers) {
        let effective = false;
        const arverni = state.arverni;

        const effectiveEntreats = this.getEffectiveEntreats(state, modifiers);
        if (modifiers.test) {
            return effectiveEntreats;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.ENTREAT);
        _.each(effectiveEntreats, (entreat) => {
            if(!modifiers.free && arverni.resources() < entreat.cost) {
                return false;
            }
            RemoveResources.execute(state, { factionId: FactionIDs.ARVERNI, count: entreat.cost});
            Entreat.execute(state, {
                entreat
            });
            effective = true;
        });

        if(!effective) {
            state.turnHistory.getCurrentTurn().rollbackSpecialAbility();
        }
        else {
            state.turnHistory.getCurrentTurn().commitSpecialAbility();
        }
        return effective;
    }

    static getEffectiveEntreats(state, modifiers) {
        let prioritizedEntreats = _(Entreat.test(state)).map((possibleEntreat) => {
            let priority = 'z';
            let chosenAlly = null;
            let chosenPlayerAlly = null;

            if (possibleEntreat.canReplaceAlly) {
                const chosenAllyFaction = _(possibleEntreat.replaceableAllyFactions).sortBy(
                    factionId => EnemyFactionPriority[factionId]).first();
                chosenAlly = this.chooseAllyForFaction(possibleEntreat, chosenAllyFaction);
                chosenPlayerAlly = this.choosePlayerAlly(state, possibleEntreat);
                priority = 'a' + EnemyFactionPriority[chosenAllyFaction];
            }

            const chosenMobileFaction = _(possibleEntreat.replaceableMobileFactions).filter(
                factionId => factionId === FactionIDs.ROMANS || factionId === FactionIDs.AEDUI).sortBy(
                factionId => EnemyFactionPriority[factionId]).first();

            if (!chosenAlly && !chosenMobileFaction) {
                return;
            }

            const bot = state.playersByFaction[FactionIDs.ARVERNI];
            const warbands = possibleEntreat.region.getWarbandsOrAuxiliaForFaction(chosenMobileFaction);
            const chosenWarband = _(Losses.orderPiecesForRemoval(state, warbands, false)).reverse().first();

            if(!chosenAlly) {
                priority = 'b' + EnemyFactionPriority[chosenMobileFaction];
            }

            return {
                entreat: possibleEntreat,
                priority,
                chosenAlly,
                chosenPlayerAlly,
                chosenWarband
            }

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();


        let numAllies = state.arverni.availableAlliedTribes().length;
        const prioritizedAccountingForNumAllies = [];
        const playerAllies = [];
        _.each(prioritizedEntreats, (entreatData) => {
            if(numAllies > 0 || entreatData.chosenWarband) {
                if(numAllies > 0 && entreatData.chosenAlly) {
                    entreatData.entreat.allyToReplace = entreatData.chosenAlly;
                    numAllies -= 1;
                }
                else {
                    entreatData.entreat.mobileToReplace = entreatData.chosenWarband;
                }
                prioritizedAccountingForNumAllies.push(entreatData);
            }
            else if(entreatData.chosenPlayerAlly) {
                entreatData.entreat.allyToReplace = entreatData.chosenPlayerAlly;
                playerAllies.push(entreatData);
            }
        });

        return _.map(_.concat(prioritizedAccountingForNumAllies, playerAllies), 'entreat');
    }

    static chooseAllyForFaction(entreat, factionId) {
        const alliedCity = entreat.region.getAlliedCityForFaction(factionId);
        const allies = entreat.region.getAlliesForFaction(factionId);
        return alliedCity ? _.find(allies, {tribeId: alliedCity.id}) : _.sample(allies);
    }

    static choosePlayerAlly(state, entreat) {
        return _(entreat.region.pieces()).filter({type: 'alliedtribe'}).filter(
            piece => state.playersByFaction[piece.factionId]).partition(
            piece => state.tribesById[piece.tribeId].isCity).map(_.shuffle).flatten().first();

    }
}

export default ArverniEntreat;