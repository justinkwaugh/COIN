import _ from '../../../lib/lodash'
import FallingSkyGameState from '../../../fallingsky/state/fallingSkyGameState'
import FactionIDs from '../../../fallingsky/config/factionIds'
import RegionIDs from '../../../fallingsky/config/regionIds'
import TribeIDs from '../../../fallingsky/config/tribeIds'

import PlaceWarbands from '../../../fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from '../../../fallingsky/actions/placeAlliedTribe'
import PlaceLeader from '../../../fallingsky/actions/placeLeader'
import PlaceAuxilia from '../../../fallingsky/actions/placeAuxilia'
import BelgaeRampage from '../../../fallingsky/bots/belgae/belgaeRampage';
import BattleResult from '../../../fallingsky/commands/battleResults';
import CommandModifier from '../../../fallingsky/commands/commandModifiers';

class TestRampage {
    static run() {
        const state = new FallingSkyGameState();

        const belgae = state.factionsById[FactionIDs.BELGAE];
        const arverni = state.factionsById[FactionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const romans = state.factionsById[FactionIDs.ROMANS];

        belgae.setResources(20);

        // Should result in rampage (last) to retreat aedui to Aedui
        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceLeader.perform(state, {faction: belgae, region: biturigesRegion});
        PlaceWarbands.perform(state, {faction: aedui, region: biturigesRegion, count: 1});
        PlaceWarbands.perform(state, {faction: belgae, region: biturigesRegion, count: 1});

        // Should not result in rampage
        const sugambriRegions = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceWarbands.perform(state, {faction: aedui, region: sugambriRegions, count: 1});
        PlaceWarbands.perform(state, {faction: belgae, region: sugambriRegions, count: 1});

        // Should result in rampage (first) against romans to remove 1
        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceAlliedTribe.perform(state, {faction: aedui, region: aeduiRegion, tribeId: TribeIDs.AEDUI});
        PlaceWarbands.perform(state, {faction: aedui, region: aeduiRegion, count: 7});
        PlaceAuxilia.perform(state, {faction: romans, region: aeduiRegion, count: 3});
        PlaceWarbands.perform(state, {faction: belgae, region: aeduiRegion, count: 1});

        // Should result in rampage (second) against arverni to retreat 2 to Veneti gain control
        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceWarbands.perform(state, {faction: belgae, region: carnutesRegion, count: 2});
        PlaceWarbands.perform(state, {faction: arverni, region: carnutesRegion, count: 2});
        PlaceWarbands.perform(state, {faction: aedui, region: carnutesRegion, count: 1});

        // Carnutes arverni can retreat here
        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceWarbands.perform(state, {faction: arverni, region: venetiRegion, count: 2});

        // Carnutes aedui can retreat here
        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceWarbands.perform(state, {faction: aedui, region: pictonesRegion, count: 2});

        // Should result in rampage removing only 1 roman due to battle
        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceAuxilia.perform(state, {faction: romans, region: arverniRegion, count: 2});
        PlaceWarbands.perform(state, {faction: belgae, region: arverniRegion, count: 2});

        // Should not result in rampage retreating aedui due to battle
        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 1});
        PlaceWarbands.perform(state, {faction: belgae, region: mandubiiRegion, count: 2});

        BelgaeRampage.rampage(
            state, new CommandModifier(
                {
                    commandSpecific: {
                        battles: [new BattleResult({regionId: mandubiiRegion.id, defendingFaction: aedui}),
                            new BattleResult({regionId: arverniRegion.id, defendingFaction: romans})]
                    }
                }));
    }
}

export default TestRampage;