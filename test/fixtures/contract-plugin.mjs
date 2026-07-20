import {
  Accessory,
  Action,
  Command,
  Icon,
  LookAhead,
  Match,
  Provider,
  Widget,
  definePlugin,
} from "../../dist/index.js";

export const representativeValues = {
  toggle: Accessory.toggle(true),
  match: Match.strong("contract"),
};

export default definePlugin({
  metadata: {
    id: "com.example.contract",
    name: "Contract Fixture",
    version: "1.0.0",
    author: "Kepler",
    icon: Icon.withBadge(Icon.sfSymbol("puzzlepiece.extension"), Icon.emoji("✓")),
  },
  searchModes: [
    Command.search({
      id: "search",
      title: "Contract Search",
      icon: Icon.rounded(Icon.asset("icons/search.png")),
      shortcutPrefix: "contract",
      placeholder: "Search contracts…",
      run(_query, ctx) {
        void ctx.notify("Loaded", { systemImage: "checkmark.circle" });
        void ctx.notifications.show("Loaded");
        return [{
          id: "toggle",
          title: "Enabled",
          accessory: Accessory.toggle(true),
          action: Action.copy("enabled"),
        }];
      },
    }),
  ],
  searchProviders: [
    Provider.results({
      id: "provider",
      title: "Contract Provider",
      match: () => Match.none(),
      run: () => [],
    }),
  ],
  widgets: [
    Widget.inline({
      id: "widget",
      title: "Contract Widget",
      priorityBias: 0.1,
      match: () => Match.exact(),
      run: () => ({
        confidence: 1,
        view: {
          type: "value",
          sectionTitle: "Contract",
          icon: Icon.withBadge(Icon.sfSymbol("doc"), Icon.emoji("✓")),
          title: "Status",
          value: "Valid",
        },
      }),
    }),
  ],
  lookAhead: [
    LookAhead.items({
      id: "upcoming",
      title: "Upcoming",
      shortcutPrefix: "upcoming",
      run: () => [{
        id: "event",
        kind: "calendar",
        title: "Contract review",
        subtitle: "Soon",
        icon: "calendar",
        startDate: "2026-07-18T12:00:00Z",
        endDate: "2026-07-18T12:30:00Z",
        progress: 0.5,
        priority: 10,
      }],
    }),
  ],
});

