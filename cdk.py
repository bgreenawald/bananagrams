#!/usr/bin/env python3

# cdk: 1.41.0
from aws_cdk import (
    aws_ec2,
    aws_ecr,
    aws_ecs,
    core,
)

from os import getenv


PROJECT_NAME = "Chalkful"


class BaseVPCStack(core.Stack):
    def __init__(self, scope: core.Stack, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # This resource alone will create a private/public subnet in each AZ as well as nat/internet gateway(s)
        self.vpc = aws_ec2.Vpc(self, "BaseVPC", cidr="10.0.0.0/24",)

        # Creating ECS Cluster in the VPC created above
        self.ecs_cluster = aws_ecs.Cluster(
            self, "ECSCluster", vpc=self.vpc, cluster_name=PROJECT_NAME
        )

        # Create two ECR repositories
        self.frontend_repository = aws_ecr.Repository(
            self,
            "FrontendRepository",
            repository_name=f"{PROJECT_NAME.lower()}_frontend",
        )

        self.backend_repository = aws_ecr.Repository(
            self, "BackendRepository", repository_name=f"{PROJECT_NAME.lower()}_backend"
        )

        # Adding service discovery namespace to cluster
        self.ecs_cluster.add_default_cloud_map_namespace(name="service",)

        # Namespace details as CFN output
        self.namespace_outputs = {
            "ARN": self.ecs_cluster.default_cloud_map_namespace.private_dns_namespace_arn,
            "NAME": self.ecs_cluster.default_cloud_map_namespace.private_dns_namespace_name,
            "ID": self.ecs_cluster.default_cloud_map_namespace.private_dns_namespace_id,
        }

        # Cluster Attributes
        self.cluster_outputs = {
            "NAME": self.ecs_cluster.cluster_name,
            "SECGRPS": str(self.ecs_cluster.connections.security_groups),
        }

        # Repository output
        self.respository_outputs = {
            "FRONTEND_URI": self.frontend_repository.repository_uri,
            "BACKEND_URI": self.backend_repository.repository_uri,
        }

        # When enabling EC2, we need the security groups "registered" to the cluster for imports in other service stacks
        if self.ecs_cluster.connections.security_groups:
            self.cluster_outputs["SECGRPS"] = str(
                [
                    x.security_group_id
                    for x in self.ecs_cluster.connections.security_groups
                ][0]
            )

        # Frontend service to backend services on 3000
        self.services_sec_group = aws_ec2.SecurityGroup(
            self,
            f"{PROJECT_NAME}FrontendToBackendSecurityGroup",
            allow_all_outbound=True,
            description=f"Security group for {PROJECT_NAME} frontend service to talk to backend services",
            vpc=self.vpc,
        )

        # Allow inbound 3000 from ALB to Frontend Service
        self.sec_grp_ingress_self_80 = aws_ec2.CfnSecurityGroupIngress(
            self,
            "InboundSecGrp3000",
            ip_protocol="TCP",
            source_security_group_id=self.services_sec_group.security_group_id,
            from_port=80,
            to_port=80,
            group_id=self.services_sec_group.security_group_id,
        )

        # All Outputs required for other stacks to build
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}NSArn",
            value=self.namespace_outputs["ARN"],
            export_name=f"{PROJECT_NAME}NSARN",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}NSName",
            value=self.namespace_outputs["NAME"],
            export_name=f"{PROJECT_NAME}NSNAME",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}NSId",
            value=self.namespace_outputs["ID"],
            export_name=f"{PROJECT_NAME}NSID",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}FE2BESecGrp",
            value=self.services_sec_group.security_group_id,
            export_name=f"{PROJECT_NAME}SecGrpId",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}ECSClusterName",
            value=self.cluster_outputs["NAME"],
            export_name=f"{PROJECT_NAME}ECSClusterName",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}ECSClusterSecGrp",
            value=self.cluster_outputs["SECGRPS"],
            export_name=f"{PROJECT_NAME}ECSSecGrpList",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}ServicesSecGrp",
            value=self.services_sec_group.security_group_id,
            export_name=f"{PROJECT_NAME}ServicesSecGrp",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}FrontendRepositoryURI",
            value=self.respository_outputs["FRONTEND_URI"],
            export_name=f"{PROJECT_NAME}FrontendRepositoryURI",
        )
        core.CfnOutput(
            self,
            f"{PROJECT_NAME}BackendRepositoryURI",
            value=self.respository_outputs["BACKEND_URI"],
            export_name=f"{PROJECT_NAME}BackendRepositoryURI",
        )


_env = core.Environment(
    account=getenv("AWS_ACCOUNT_ID"), region=getenv("AWS_DEFAULT_REGION")
)
stack_name = PROJECT_NAME
app = core.App()
BaseVPCStack(app, stack_name, env=_env)
app.synth()
