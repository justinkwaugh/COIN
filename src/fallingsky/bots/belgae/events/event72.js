import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import Battle from 'fallingsky/commands/battle';
import CommandIDs from 'fallingsky/config/commandIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import TurnContext from 'common/turnContext';
import MovePieces from 'fallingsky/actions/movePieces';

class Event72 {
    static handleEvent(state) {
        const winningPlayers = _(state.playersByFaction).reject(player => player.isNonPlayer).map(player => {
            return {
                player,
                priority: 50 - player.victoryMargin(state)
            }
        }).sortBy('priority').groupBy('priority').map(_.shuffle).first();

        const target = _(winningPlayers).map(player => this.findTargetRegionForPlayer(state, player)).sortBy(
            'priority').first();

        if (!target) {
            return false;
        }

        this.marchToTarget(state, target);
        this.battlePlayer(state, target);

        return true;
    }

    static findTargetRegionForPlayer(state, player) {
        return _(state.regions).shuffle().filter(region => region.getPiecesForFaction(player.factionId)).map(region => {
            const bestAdjacent = _.reduce(region.adjacent, (accumulator, adjacent) => {
                const numCanMove = adjacent.getHiddenWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE).length;
                if (numCanMove > accumulator.max) {
                    accumulator.max = numCanMove;
                    accumulator.sourceRegion = adjacent;
                }

                return accumulator;
            }, {sourceRegion: null, max: 0});

            const mostToMove = bestAdjacent.max;
            if (mostToMove < 2) {
                return;
            }

            const pieces = bestAdjacent.sourceRegion.getHiddenWarbandsOrAuxiliaForFaction(FactionIDs.BELGAE);

            const battleResults = Battle.test(state, {
                region: region,
                attackingFactionId: FactionIDs.BELGAE,
                defendingFactionId: player.factionId,
                attackingPieces: pieces
            });

            if (battleResults.defenderLosses.normal === 0) {
                return;
            }

            const controlMargin = region.controllingMarginByFaction()[FactionIDs.BELGAE];
            const hasControl = controlMargin > 0;
            const canAddControl = controlMargin + mostToMove > 0;
            const controlPriority = ((hasControl || !canAddControl) ? 'c' : region.group === RegionGroups.BELGICA ? 'a' : 'b') + (50 - controlMargin);

            return {
                factionId: player.factionId,
                region,
                sourceRegion: bestAdjacent.sourceRegion,
                pieces,
                priority: (99 - mostToMove) + '-' + controlPriority
            }
        }).compact().sortBy('priority').groupBy('priority').flatten().first();
    }

    static marchToTarget(state, target) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e72',
                                             free: true,
                                             noSpecial: true,
                                             limited: true
                                         }));

        turn.startCommand(CommandIDs.MARCH);
        MovePieces.execute(state, {
            factionId: FactionIDs.BELGAE,
            sourceRegionId: target.sourceRegion.id,
            destRegionId: target.region.id,
            pieces: target.pieces
        });
        turn.commitCommand();
        turn.popContext();
    }

    static battlePlayer(state, target) {
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e72-1',
                                             free: true,
                                             noSpecial: true,
                                             limited: true
                                         }));

        turn.startCommand(CommandIDs.BATTLE);
        const battleResults = Battle.test(state, {
            region: target.region,
            attackingFactionId: FactionIDs.BELGAE,
            defendingFactionId: target.factionId,
            attackingPieces: target.pieces
        });

        Battle.execute(state, {
            battleResults
        });

        turn.commitCommand();
        turn.popContext();
    }


}

export default Event72