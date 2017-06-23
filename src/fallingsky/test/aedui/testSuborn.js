define(function (require) {
    'use strict';

    var Selfish = require('lib/selfish');
    var _ = require('lib/lodash');
    var FallingSkyGameState = require('fallingsky/state/fallingSkyGameState');
    var Factions = require('fallingsky/config/factions');
    var Regions = require('fallingsky/config/regions');
    var Tribes = require('fallingsky/config/tribes');

    var PlaceWarbands = require('fallingsky/actions/placeWarbands');
    var PlaceAlliedTribe = require('fallingsky/actions/placeAlliedTribe');
    var PlaceCitadel = require('fallingsky/actions/placeCitadel');
    var PlaceLeader = require('fallingsky/actions/placeLeader');
    var PlaceAuxilia = require('fallingsky/actions/placeAuxilia');
    var PlaceFort = require('fallingsky/actions/placeFort');
    var PlaceLegions = require('fallingsky/actions/placeLegions');

    var Suborn = require('fallingsky/commands/aedui/suborn');

    var AeduiBot = require('fallingsky/bots/aedui/aeduiBot');

    var TestSuborn = Selfish.Base.extend({
        initialize: function initialize(definition) {
            var that = this;
        },
        run: function run() {
            var state = FallingSkyGameState.create();

            var belgae = state.factionsById[Factions.FactionIDs.BELGAE];
            var arverni = state.factionsById[Factions.FactionIDs.ARVERNI];
            var aedui = state.factionsById[Factions.FactionIDs.AEDUI];
            var romans = state.factionsById[Factions.FactionIDs.ROMANS];
            var germanic = state.factionsById[Factions.FactionIDs.GERMANIC_TRIBES];

            aedui.setResources(20);

            var aeduiRegion = state.regionsById[Regions.RegionIDs.AEDUI];
            PlaceAlliedTribe.perform(state, { faction: aedui, region: aeduiRegion, tribeId: Tribes.TribeIDs.AEDUI});
            PlaceWarbands.perform(state, { faction: aedui, region: aeduiRegion, count: 1});

            var mandubiiRegion = state.regionsById[Regions.RegionIDs.MANDUBII];
            PlaceCitadel.perform(state, { faction: arverni, region: mandubiiRegion, tribeId : Tribes.TribeIDs.MANDUBII }, true);
            PlaceAlliedTribe.perform(state, { faction: belgae, region: mandubiiRegion, tribeId : Tribes.TribeIDs.SENONES});
            PlaceAlliedTribe.perform(state, { faction: romans, region: mandubiiRegion, tribeId : Tribes.TribeIDs.LINGONES});
            PlaceLeader.perform(state, { faction: belgae, region: mandubiiRegion});
            PlaceFort.perform(state, { faction: romans, region: mandubiiRegion});

            PlaceWarbands.perform(state, { faction: belgae, region: mandubiiRegion, count: 1});
            PlaceWarbands.perform(state, { faction: arverni, region: mandubiiRegion, count: 1});
            PlaceWarbands.perform(state, { faction: aedui, region: mandubiiRegion, count: 1});

            var sequaniRegion = state.regionsById[Regions.RegionIDs.SEQUANI];
            PlaceAlliedTribe.perform(state, { faction: belgae, region: sequaniRegion, tribeId : Tribes.TribeIDs.SEQUANI});
            PlaceAlliedTribe.perform(state, { faction: germanic, region: sequaniRegion, tribeId : Tribes.TribeIDs.HELVETII});
            PlaceWarbands.perform(state, { faction: arverni, region: sequaniRegion, count: 1});
            PlaceWarbands.perform(state, { faction: aedui, region: sequaniRegion, count: 1});

            var provinciaRegion = state.regionsById[Regions.RegionIDs.PROVINCIA];
            PlaceAlliedTribe.perform(state, { faction: romans, region: provinciaRegion, tribeId: Tribes.TribeIDs.HELVII});
            PlaceAuxilia.perform(state, { faction: romans, region: provinciaRegion, count: 4});
            PlaceWarbands.perform(state, { faction: aedui, region: provinciaRegion, count: 1});

            var ubiiRegion = state.regionsById[Regions.RegionIDs.UBII];
            PlaceAlliedTribe.perform(state, { faction: germanic, region: ubiiRegion, tribeId: Tribes.TribeIDs.SUEBI_SOUTH});
            PlaceWarbands.perform(state, { faction: germanic, region: ubiiRegion, count: 4});
            state.logState();

            var venetiRegion = state.regionsById[Regions.RegionIDs.VENETI];
            PlaceAlliedTribe.perform(state, { faction: arverni, region: venetiRegion, tribeId: Tribes.TribeIDs.VENETI});
            PlaceAlliedTribe.perform(state, { faction: belgae, region: venetiRegion, tribeId: Tribes.TribeIDs.NAMNETES});
            PlaceWarbands.perform(state, { faction: aedui, region: venetiRegion, count: 15});
            PlaceWarbands.perform(state, { faction: belgae, region: venetiRegion, count: 1});

            var bot = AeduiBot.create();
            var suborned = bot.suborn(state);
        }
    });

    return TestSuborn;
});