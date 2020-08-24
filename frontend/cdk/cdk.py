#!/usr/bin/env python3

# cdk: 1.25.0
from aws_cdk import (
    aws_ec2,
    aws_ecr,
    aws_ecs,
    aws_ecs_patterns,
    aws_iam,
    aws_servicediscovery,
    core,
)

from os import getenv


PROJECT_NAME = "Chalkful"


# Creating a construct that will populate the required objects created in the platform repo such as vpc, ecs cluster, and service discovery namespace
class BasePlatform(core.Construct):
    def __init__(self, scope: core.Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        self.environment_name = PROJECT_NAME

        # The base platform stack is where the VPC was created, so all we need is the name to do a lookup and import it into this stack for use
        self.vpc = aws_ec2.Vpc.from_lookup(
            self, "VPC", vpc_name=f"{self.environment_name}/BaseVPC"
        )

        self.sd_namespace = aws_servicediscovery.PrivateDnsNamespace.from_private_dns_namespace_attributes(
            self,
            "SDNamespace",
            namespace_name=core.Fn.import_value(f"{PROJECT_NAME}NSNAME"),
            namespace_arn=core.Fn.import_value(f"{PROJECT_NAME}NSARN"),
            namespace_id=core.Fn.import_value(f"{PROJECT_NAME}NSID"),
        )

        self.ecs_cluster = aws_ecs.Cluster.from_cluster_attributes(
            self,
            "ECSCluster",
            cluster_name=core.Fn.import_value(f"{PROJECT_NAME}ECSClusterName"),
            security_groups=[],
            vpc=self.vpc,
            default_cloud_map_namespace=self.sd_namespace,
        )

        self.services_sec_grp = aws_ec2.SecurityGroup.from_security_group_id(
            self,
            "ServicesSecGrp",
            security_group_id=core.Fn.import_value(f"{PROJECT_NAME}ServicesSecGrp"),
        )


class AngularService(core.Stack):
    def __init__(self, scope: core.Stack, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        self.base_platform = BasePlatform(self, self.stack_name)

        self.fargate_task_image = aws_ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
            image=aws_ecs.ContainerImage.from_ecr_repository(
                aws_ecr.Repository.from_repository_name(
                    self, "chalkful_frontend_image", repository_name="chalkful_frontend"
                ),
                tag="latest",
            ),
            container_port=80,
        )

        self.fargate_load_balanced_service = aws_ecs_patterns.ApplicationLoadBalancedFargateService(
            self,
            f"{PROJECT_NAME}FrontendFargateLBService",
            service_name=f"{PROJECT_NAME.lower()}-frontend",
            cluster=self.base_platform.ecs_cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            public_load_balancer=True,
            cloud_map_options=self.base_platform.sd_namespace,
            task_image_options=self.fargate_task_image,
        )

        self.fargate_load_balanced_service.service.connections.allow_to(
            self.base_platform.services_sec_grp,
            port_range=aws_ec2.Port(
                protocol=aws_ec2.Protocol.TCP,
                string_representation=f"{PROJECT_NAME.lower()}frontendtobackend",
                from_port=5000,
                to_port=5000,
            ),
        )


_env = core.Environment(
    account=getenv("AWS_ACCOUNT_ID"), region=getenv("AWS_DEFAULT_REGION")
)
stack_name = f"{PROJECT_NAME}-frontend"
app = core.App()
AngularService(app, stack_name, env=_env)
app.synth()
