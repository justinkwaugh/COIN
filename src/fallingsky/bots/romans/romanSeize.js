import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import Seize from '../../commands/romans/seize';
import AddResources from 'fallingsky/actions/addResources';
import ArverniRally from 'fallingsky/bots/arverni/arverniRally';
import BelgaeRally from 'fallingsky/bots/belgae/belgaeRally';
import DisperseTribe from 'fallingsky/actions/disperseTribe';
import FactionActions from '../../../common/factionActions';
import RomanBuild from 'fallingsky/bots/romans/romanBuild';
import RomanScout from 'fallingsky/bots/romans/romanScout';
import TurnContext from 'common/turnContext';


class RomanSeize {
    static seize(state, modifiers) {
        const executableSeizes = this.getExecutableSeizes(state, modifiers);
        if(executableSeizes.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.SEIZE);
        _.each(executableSeizes, (seize) => {
            if(seize.willDisperse) {
                const tribe = _(seize.region.getSubduedTribes()).sortBy(tribe=>tribe.isCity).first();
                DisperseTribe.execute(state, { factionId: FactionIDs.ROMANS, tribeId: tribe.id});

                _.each([FactionIDs.ARVERNI, FactionIDs.BELGAE], (factionId) => {
                    const canRally = _.random(1,6) < 4;

                    if(canRally) {
                        this.handleRally(state, factionId, seize);
                    }
                })
            }

            AddResources.execute(state, { factionId: FactionIDs.ROMANS, count: seize.resourcesGained + (seize.willDisperse ? 6 : 0)});

            if(seize.harassmentLosses > 0 ) {
                throw Error('Should not have harassment lossses!');
            }
        });

        state.turnHistory.getCurrentTurn().commitCommand();
        modifiers.context.seizeRegions = _.map(executableSeizes, seize=> seize.region.id);
        const usedSpecialAbility = modifiers.canDoSpecial() && RomanBuild.build(state, modifiers) || RomanScout.scout(state, modifiers);
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static handleRally(state, factionId, seize) {
        // ASK PLAYER

        const regions = _(seize.region.adjacent).reject(adjacent => adjacent.devastated()).map('id').value();
        if(factionId === FactionIDs.ARVERNI) {
            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.ARVERNI, free: true, noSpecial: true, allowedRegions: regions}));
            ArverniRally.rally(state, turn.getContext());
            turn.popContext();
        }
        else if(factionId === FactionIDs.BELGAE) {
            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({currentFactionId: FactionIDs.BELGAE, free: true, noSpecial: true, allowedRegions: regions}));
            BelgaeRally.rally(state, turn.getContext());
            turn.popContext();
        }
    }

    // static handleHarassment(state, seize) {
    //     _.each(_.concat(state.currentCard().initiativeOrder, [FactionIDs.GERMANIC_TRIBES]), factionId=> {
    //         // ASK PLAYER
    //         if(factionId === FactionIDs.ROMANS) {
    //             return;
    //         }
    //
    //         const numHiddenWarbands = seize.region.getHiddenWarbandsOrAuxiliaForFaction(factionId).length;
    //         if(numHiddenWarbands < 3) {
    //             return;
    //         }
    //
    //         const player = state.playersByFaction[factionId];
    //         if(player.willHarass(FactionIDs.ROMANS)) {
    //             const losses = Math.floor(numHiddenWarbands / 3);
    //
    //         }
    //     });
    // }

    static getExecutableSeizes(state, modifiers) {
        const possibleSeizes = _(Seize.test(state)).filter({harassmentLosses: 0}).shuffle().value();
        const dispersalSeize = this.getDispersalSeize(state, modifiers, possibleSeizes);
        if(dispersalSeize) {
            dispersalSeize.willDisperse = true;
        }
        return _([dispersalSeize]).concat(possibleSeizes).compact().uniqBy(seize=>seize.region.id).value();
    }

    static getDispersalSeize(state, modifiers, possibleSeizes) {
        return _(possibleSeizes).map((seize) => {
            let priority = 'z';
            if (!seize.canDisperse) {
                return;
            }
            const hasPlayerPieces = _.find(FactionIDs, factionId => factionId !== FactionIDs.ROMANS &&
                                                                    !state.playersByFaction[factionId].isNonPlayer &&
                                                                    seize.region.getPiecesForFaction(
                                                                        factionId).length > 0);

            if (hasPlayerPieces) {
                priority = 'a';
            }
            else if (seize.region.group === RegionGroups.BELGICA) {
                priority = 'b';
            }
            else if (_.find(this.getFactionsWithHighestVictoryMargin(state),
                            factionId => seize.region.getPiecesForFaction(factionId).length > 0)) {
                priority = 'c';
            }


            return {
                seize,
                priority
            };
        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('seize').first();
    }

    static getFactionsWithHighestVictoryMargin(state) {
        return _.reduce([FactionIDs.BELGAE, FactionIDs.ARVERNI, FactionIDs.AEDUI], (accumulator, factionId) => {
            const factionVictoryMargin = state.factionsById[factionId].victoryMargin(state);
            if (factionVictoryMargin > accumulator.victoryMargin) {
                accumulator.victoryMargin = factionVictoryMargin;
                accumulator.factions = [factionId];
            }
            else if (factionVictoryMargin === accumulator.victoryMargin) {
                accumulator.factions.push(factionId);
            }
            return accumulator;
        }, {victoryMargin: -99, factions: []});
    }

}

export default RomanSeize