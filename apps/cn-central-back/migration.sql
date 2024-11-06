# 2.0.11
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Source', 'TASK.gws_core.InputTask');
update scenario
SET protocol = REPLACE(protocol, 'TASK.gws_core.Sink', 'TASK.gws_core.OutputTask');
