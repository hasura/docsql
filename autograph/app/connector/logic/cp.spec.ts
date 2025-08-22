import { patchMetadata } from "./cp";

describe("patchMetadata", () => {
  test("should apply patches to metadata correctly", () => {
    let baseMetadata = {
      subgraphs: [
        {
          name: "cl_common_masters",
          objects: [
            {
              definition: {
                aggregateExpression: "public_vendor_lane_quotes_agg_exp",
                filterExpressionType: "public_vendor_lane_quotes_bool_exp",
                graphql: {
                  aggregate: {
                    queryRootField: "public_vendor_lane_quotes_aggregate",
                    subscription: {
                      rootField: "public_vendor_lane_quotes_aggregate",
                    },
                  },
                  filterInputTypeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes_filter_input",
                  selectMany: {
                    queryRootField: "public_vendor_lane_quotes",
                    subscription: {
                      rootField: "public_vendor_lane_quotes",
                    },
                  },
                  selectUniques: [],
                },
                name: "public_vendor_lane_quotes",
                objectType: "public_vendor_lane_quotes",
                orderByExpression: "public_vendor_lane_quotes_order_by_exp",
                source: {
                  collection: "public.vendor_lane_quotes",
                  dataConnectorName: "cl_procure_staging_transactions_db",
                },
              },
              kind: "Model",
              version: "v2",
            },
            {
              definition: {
                dataConnectorTypeMapping: [
                  {
                    dataConnectorName: "cl_procure_staging_transactions_db",
                    dataConnectorObjectType: "public.vendor_lane_quotes",
                  },
                ],
                description:
                  "Each row in this table contains represents a base freight rate given by a vendor for a proposal against a lane",
                fields: [
                  {
                    name: "base_freight_type",
                    type: "string",
                  },
                  {
                    name: "base_rate",
                    type: "float_64!",
                  },
                  {
                    name: "base_rate_currency",
                    type: "string!",
                  },
                  {
                    name: "base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "calculated_cost",
                    type: "float_64",
                  },
                  {
                    name: "can_edit_rate_from",
                    type: "boolean!",
                  },
                  {
                    name: "can_edit_rate_to",
                    type: "boolean!",
                  },
                  {
                    name: "chargeable_cbm",
                    type: "float_64",
                  },
                  {
                    name: "chargeable_weight",
                    type: "float_64",
                  },
                  {
                    description:
                      "client_id is an internal field. Do NOT use client_id in SELECT expressions, but you can use it in JOINS",
                    name: "client_id",
                    type: "int_64!",
                  },
                  {
                    name: "created_at",
                    type: "timestamptz!",
                  },
                  {
                    name: "delivery_type",
                    type: "string",
                  },
                  {
                    name: "destination_port",
                    type: "string",
                  },
                  {
                    name: "discount",
                    type: "float_64",
                  },
                  {
                    name: "discount_cntr",
                    type: "float_64",
                  },
                  {
                    name: "estimated_arrival_date",
                    type: "timestamptz",
                  },
                  {
                    name: "fuel_inclusive",
                    type: "boolean!",
                  },
                  {
                    description:
                      "id is an internal field. Do NOT use id in SELECT expressions, but you can use it in JOINS",
                    name: "id",
                    type: "int_64!",
                  },
                  {
                    name: "is_calc_cost_an_anomaly",
                    type: "boolean",
                  },
                  {
                    name: "is_override_rate",
                    type: "boolean",
                  },
                  {
                    description:
                      "lane_quote_request_id is an internal field. Do NOT use lane_quote_request_id in SELECT expressions, but you can use it in JOINS",
                    name: "lane_quote_request_id",
                    type: "int_64!",
                  },
                  {
                    name: "lane_type",
                    type: "string",
                  },
                  {
                    name: "liner_name",
                    type: "string",
                  },
                  {
                    name: "mode",
                    type: "string",
                  },
                  {
                    name: "rate_effective_from",
                    type: "date",
                  },
                  {
                    name: "rate_effective_to",
                    type: "date",
                  },
                  {
                    name: "route_additional_cost",
                    type: "string",
                  },
                  {
                    description:
                      "se_round_id is an internal field. Do NOT use se_round_id in SELECT expressions, but you can use it in JOINS",
                    name: "se_round_id",
                    type: "int_64",
                  },
                  {
                    name: "service_level",
                    type: "string",
                  },
                  {
                    name: "shipment_type",
                    type: "string",
                  },
                  {
                    name: "shipper_cntr_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "shipper_cntr_base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "shipper_updated_by",
                    type: "int_64",
                  },
                  {
                    name: "shipper_vwbl_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "shipper_vwbl_base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "shipper_vwbl_calc_cost",
                    type: "float_64",
                  },
                  {
                    name: "source_port",
                    type: "string",
                  },
                  {
                    name: "transit_time",
                    type: "float_32",
                  },
                  {
                    name: "transit_time_unit",
                    type: "string",
                  },
                  {
                    name: "updated_at",
                    type: "timestamptz!",
                  },
                  {
                    name: "vendor_lane_quote_received_time",
                    type: "timestamptz!",
                  },
                  {
                    description:
                      "vendor_proposal_id is an internal field. Do NOT use vendor_proposal_id in SELECT expressions, but you can use it in JOINS",
                    name: "vendor_proposal_id",
                    type: "int_64!",
                  },
                  {
                    name: "vendor_updated_by",
                    type: "int_64",
                  },
                  {
                    name: "vendor_vwbl_cntr_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "vendor_vwbl_cntr_base_rate_min",
                    type: "float_64",
                  },
                  {
                    description:
                      "vq_interpolation_id is an internal field. Do NOT use vq_interpolation_id in SELECT expressions, but you can use it in JOINS",
                    name: "vq_interpolation_id",
                    type: "int_64",
                  },
                ],
                graphql: {
                  inputTypeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes_input",
                  typeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes",
                },
                name: "public_vendor_lane_quotes",
              },
              kind: "ObjectType",
              version: "v1",
            },
          ],
        },
      ],
    };

    let patches = [
      {
        subgraph: "cl_common_masters",
        kind: "Model",
        name: "public_vendor_lane_quotes",
        fieldName: "",
        description:
          "Stores vendor quotes for specific shipping lanes in air freight procurement events. Contains base rates and pricing information from vendors participating in sourcing events. Used for procurement decision-making and rate comparisons across different vendors for the same shipping route.",
      },
      {
        subgraph: "cl_common_masters",
        kind: "ObjectType",
        name: "public_vendor_lane_quotes",
        fieldName: "client_id",
        description:
          "Internal database identifier for client. This field is strictly for internal database operations and joins only - must never be displayed to end users or in user-facing interfaces. Used for referential integrity and internal system operations.",
      },
      {
        subgraph: "cl_common_masters",
        kind: "ObjectType",
        name: "public_vendor_lane_quotes",
        fieldName: "base_rate",
        description:
          "Base freight rate quoted by vendor for the shipping lane. Should be formatted to 2 decimal places for professional presentation in procurement reports and user interfaces. Represents the fundamental cost component before additional fees and surcharges.",
      },
    ];

    let expectedMetadata = {
      subgraphs: [
        {
          name: "cl_common_masters",
          objects: [
            {
              definition: {
                description:
                  "Stores vendor quotes for specific shipping lanes in air freight procurement events. Contains base rates and pricing information from vendors participating in sourcing events. Used for procurement decision-making and rate comparisons across different vendors for the same shipping route.",
                aggregateExpression: "public_vendor_lane_quotes_agg_exp",
                filterExpressionType: "public_vendor_lane_quotes_bool_exp",
                graphql: {
                  aggregate: {
                    queryRootField: "public_vendor_lane_quotes_aggregate",
                    subscription: {
                      rootField: "public_vendor_lane_quotes_aggregate",
                    },
                  },
                  filterInputTypeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes_filter_input",
                  selectMany: {
                    queryRootField: "public_vendor_lane_quotes",
                    subscription: {
                      rootField: "public_vendor_lane_quotes",
                    },
                  },
                  selectUniques: [],
                },
                name: "public_vendor_lane_quotes",
                objectType: "public_vendor_lane_quotes",
                orderByExpression: "public_vendor_lane_quotes_order_by_exp",
                source: {
                  collection: "public.vendor_lane_quotes",
                  dataConnectorName: "cl_procure_staging_transactions_db",
                },
              },
              kind: "Model",
              version: "v2",
            },
            {
              definition: {
                dataConnectorTypeMapping: [
                  {
                    dataConnectorName: "cl_procure_staging_transactions_db",
                    dataConnectorObjectType: "public.vendor_lane_quotes",
                  },
                ],
                description:
                  "Each row in this table contains represents a base freight rate given by a vendor for a proposal against a lane",
                fields: [
                  {
                    name: "base_freight_type",
                    type: "string",
                  },
                  {
                    description:
                      "Base freight rate quoted by vendor for the shipping lane. Should be formatted to 2 decimal places for professional presentation in procurement reports and user interfaces. Represents the fundamental cost component before additional fees and surcharges.",
                    name: "base_rate",
                    type: "float_64!",
                  },
                  {
                    name: "base_rate_currency",
                    type: "string!",
                  },
                  {
                    name: "base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "calculated_cost",
                    type: "float_64",
                  },
                  {
                    name: "can_edit_rate_from",
                    type: "boolean!",
                  },
                  {
                    name: "can_edit_rate_to",
                    type: "boolean!",
                  },
                  {
                    name: "chargeable_cbm",
                    type: "float_64",
                  },
                  {
                    name: "chargeable_weight",
                    type: "float_64",
                  },
                  {
                    description:
                      "Internal database identifier for client. This field is strictly for internal database operations and joins only - must never be displayed to end users or in user-facing interfaces. Used for referential integrity and internal system operations.",
                    name: "client_id",
                    type: "int_64!",
                  },
                  {
                    name: "created_at",
                    type: "timestamptz!",
                  },
                  {
                    name: "delivery_type",
                    type: "string",
                  },
                  {
                    name: "destination_port",
                    type: "string",
                  },
                  {
                    name: "discount",
                    type: "float_64",
                  },
                  {
                    name: "discount_cntr",
                    type: "float_64",
                  },
                  {
                    name: "estimated_arrival_date",
                    type: "timestamptz",
                  },
                  {
                    name: "fuel_inclusive",
                    type: "boolean!",
                  },
                  {
                    description:
                      "id is an internal field. Do NOT use id in SELECT expressions, but you can use it in JOINS",
                    name: "id",
                    type: "int_64!",
                  },
                  {
                    name: "is_calc_cost_an_anomaly",
                    type: "boolean",
                  },
                  {
                    name: "is_override_rate",
                    type: "boolean",
                  },
                  {
                    description:
                      "lane_quote_request_id is an internal field. Do NOT use lane_quote_request_id in SELECT expressions, but you can use it in JOINS",
                    name: "lane_quote_request_id",
                    type: "int_64!",
                  },
                  {
                    name: "lane_type",
                    type: "string",
                  },
                  {
                    name: "liner_name",
                    type: "string",
                  },
                  {
                    name: "mode",
                    type: "string",
                  },
                  {
                    name: "rate_effective_from",
                    type: "date",
                  },
                  {
                    name: "rate_effective_to",
                    type: "date",
                  },
                  {
                    name: "route_additional_cost",
                    type: "string",
                  },
                  {
                    description:
                      "se_round_id is an internal field. Do NOT use se_round_id in SELECT expressions, but you can use it in JOINS",
                    name: "se_round_id",
                    type: "int_64",
                  },
                  {
                    name: "service_level",
                    type: "string",
                  },
                  {
                    name: "shipment_type",
                    type: "string",
                  },
                  {
                    name: "shipper_cntr_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "shipper_cntr_base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "shipper_updated_by",
                    type: "int_64",
                  },
                  {
                    name: "shipper_vwbl_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "shipper_vwbl_base_rate_min",
                    type: "float_64",
                  },
                  {
                    name: "shipper_vwbl_calc_cost",
                    type: "float_64",
                  },
                  {
                    name: "source_port",
                    type: "string",
                  },
                  {
                    name: "transit_time",
                    type: "float_32",
                  },
                  {
                    name: "transit_time_unit",
                    type: "string",
                  },
                  {
                    name: "updated_at",
                    type: "timestamptz!",
                  },
                  {
                    name: "vendor_lane_quote_received_time",
                    type: "timestamptz!",
                  },
                  {
                    description:
                      "vendor_proposal_id is an internal field. Do NOT use vendor_proposal_id in SELECT expressions, but you can use it in JOINS",
                    name: "vendor_proposal_id",
                    type: "int_64!",
                  },
                  {
                    name: "vendor_updated_by",
                    type: "int_64",
                  },
                  {
                    name: "vendor_vwbl_cntr_base_rate",
                    type: "float_64",
                  },
                  {
                    name: "vendor_vwbl_cntr_base_rate_min",
                    type: "float_64",
                  },
                  {
                    description:
                      "vq_interpolation_id is an internal field. Do NOT use vq_interpolation_id in SELECT expressions, but you can use it in JOINS",
                    name: "vq_interpolation_id",
                    type: "int_64",
                  },
                ],
                graphql: {
                  inputTypeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes_input",
                  typeName:
                    "cl_procure_staging_transactions_dbpublic_vendor_lane_quotes",
                },
                name: "public_vendor_lane_quotes",
              },
              kind: "ObjectType",
              version: "v1",
            },
          ],
        },
      ],
    };
    expect(patchMetadata(patches, baseMetadata)).toStrictEqual(
      expectedMetadata
    );
  });
});
